//Big thanks to https://github.com/agar3s/spacewars13k-server for their AS NFT implmentation

import { context, PersistentMap, PersistentSet, u128, ContractPromise, storage, env, util, logging } from "near-sdk-as"
import { Token, NFTMetadata, TokenMetadata, AuctionItem } from "./model";

const ONE_NEAR = u128.from('1000000000000000000000000')
const TEN_CENT = u128.from('100000000000000000000000')
const ONE_CENT = u128.from('10000000000000000000000')
const TWO_CENT = u128.from('20000000000000000000000')
const BOATLOAD_OF_GAS = 100000000000000;
const TGAS_50 = 50000000000000;

export const TokenMetadataByIndex = new PersistentMap<u64, TokenMetadata>("token_meta_2");
const itemToAccount = new PersistentMap<u64, string>("itemToAccount_2");
const itemToMetadata = new PersistentMap<u64, u64>("itemToMetadata_2");
const itemMarket = new PersistentMap<u64, AuctionItem>("itemMarket_2");

function validate_admin(): bool {
  return context.sender == context.contractName;
}

function owner_items(owner_id: string): PersistentSet<u64> {
    return new PersistentSet<u64>(`accountToItems2::${owner_id}`);
}

// BEGIN NFT (NEP-171)
export function init(owner_id: string, metadata: NFTMetadata): void {
  assert(validate_admin(), 'You are not authorized to run this function');
  const Metadata: NFTMetadata = new NFTMetadata(
    metadata.spec, metadata.name, metadata.symbol, metadata.icon, 
    metadata.base_uri, metadata.reference, metadata.reference_hash);
  storage.set("global_meta", Metadata);
}

export function nft_metadata(): NFTMetadata {
  return storage.getSome<NFTMetadata>("global_meta");
}

export function nft_create_metadata(index: u64, metadata: TokenMetadata): void {
  assert(validate_admin(), 'You are not authorized to run this function');
  TokenMetadataByIndex.set(index, metadata);
}

export function nft_mint(receiver_id: string, index: u64): u64 {
  assert(validate_admin(), 'You are not authorized to run this function');

  let next_token_id = storage.getPrimitive<u64>("counter_token_id", 0);
  storage.set<u64>("counter_token_id", next_token_id + 1);

  itemToMetadata.set(next_token_id, index)
  owner_items(receiver_id).add(next_token_id)
  /*const owner = accountToItems.get(owner_id)
  if (owner == null) {
    accountToItems.set(owner_id, new Set<u128>())
    accountToItems.getSome(owner_id).add(next_token_id)
  } else {
    owner.add(next_token_id)
  }*/
  //Do we need this for extra gas / storage?
  //itemToAccount.set(next_token_id, owner_id)
  return next_token_id;
}

// Simple transfer. Transfer a given `token_id` from current owner to
// `receiver_id`.
//
// Requirements
// * Caller of the method must attach a deposit of 1 yoctoⓃ for security purposes
// * Contract MUST panic if called by someone other than token owner or,
//   if using Approval Management, one of the approved accounts
// * `approval_id` is for use with Approval Management extension, see
//   that document for full explanation.
// * If using Approval Management, contract MUST nullify approved accounts on
//   successful transfer.
//
// Arguments:
// * `receiver_id`: the valid NEAR account receiving the token
// * `token_id`: the token to transfer
// * `approval_id`: expected approval ID. A number smaller than
//    2^53, and therefore representable as JSON. See Approval Management
//    standard for full explanation.
// * `memo` (optional): for use cases that may benefit from indexing or
//    providing information for a transfer
export function nft_transfer(receiver_id: string, token_id: u64, approval_id: u64=0, memo?: string|null) : void {
  assert(u128.from(context.attachedDeposit) == u128.from(1), 'Requires attached deposit of exactly 1 yoctoNEAR')
  const sender_id = context.predecessor

  assert(owner_items(sender_id).has(token_id) == true)

  owner_items(sender_id).delete(token_id)
  owner_items(receiver_id).add(token_id)
  logging.log(`transfer ${token_id} from ${sender_id} to ${receiver_id}`)
}

export function nft_token_metadata(token_id: u64): TokenMetadata|null {
    const index = itemToMetadata.getSome(token_id);
    return TokenMetadataByIndex.get(index);
}

export function nft_tokens_for_owner_set(account_id: string): Array<u64> {
  const owner_set = owner_items(account_id);
  if (owner_set == null) {
    return new Array<u64>();
  } else {
    return owner_set.values();
  }
}

//Do we need this? Extra gas
export function nft_token(token_id: u64): Token|null {
  return null;
}
export function nft_tokens_for_owner(account_id: string): Array<Token> {
    return new Array<Token>();
}
// END NEP-171

// Market functionalty
export function nft_market_sell(token_id: u64, price: u128): void {
    const has_token = owner_items(context.sender).has(token_id)
    assert(has_token == true, "nft does not exist under this user")
    assert(price >= TWO_CENT, "minimum listing price 0.02 NEAR")
    owner_items(context.sender).delete(token_id)
    const index = itemToMetadata.getSome(token_id)

    let auction_item: AuctionItem = {
      token_id: token_id,
      index: index,
      owner_id: context.sender,
      price: price,
      block_listed: context.blockIndex
    };
    itemMarket.set(token_id, auction_item)
}

export function nft_market_buy(token_id: u64): void {
    const aucitem = itemMarket.getSome(token_id)
    assert(context.attachedDeposit >= aucitem.price, "not enough NEAR attached to buy")
    itemMarket.delete(token_id)
    owner_items(context.sender).add(token_id)
    if (context.attachedDeposit > aucitem.price) {
        const overpay_refund = context.attachedDeposit - aucitem.price
        _nft_market_buy_refund(context.sender, overpay_refund)
    }
    //10% commission
    var calc_commision = u128.mul(aucitem.price, u128.from(100))
    calc_commision = u128.div(calc_commision, u128.from(10))
    calc_commision = u128.div(calc_commision, u128.from(100))
    logging.log(`${context.sender} bought ${token_id} from ${aucitem.owner_id} for ${aucitem.price} commission was ${calc_commision}`)
    _nft_market_buy_refund(aucitem.owner_id, aucitem.price - calc_commision)
}

export function nft_market_cancel(token_id: u64): void {
    const aucitem = itemMarket.getSome(token_id)
    assert(context.sender == aucitem.owner_id, "you are not the owner")
    itemMarket.delete(token_id)
    owner_items(aucitem.owner_id).add(token_id)
}

function _nft_market_buy_refund(account_id: string, amount: u128) : void {
    const accountIdArr = util.stringToBytes(account_id)
    const promise_id: u64 = env.promise_batch_create(accountIdArr.byteLength, accountIdArr.dataStart)
    const amountArr = amount.toUint8Array()
    env.promise_batch_action_transfer(promise_id, amountArr.dataStart)
}
