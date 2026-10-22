---
title: "Keep the latest bid, not the highest"
authors: "Blockspace Forum"
date: "Oct 2026"
subtitle: "We strongly advocate that clients who request multiple bids per builder keep the latest not the highest."
---

**TL;DR:** We strongly advocate that clients who request multiple bids per builder keep the latest not the highest. If clients offer the highest as a hardcoded option, the second order impact has implications on the robustness, performance, and economics of Ethereum and its stakeholders.
{: .tldr }

1. Builders build thousands of blocks per slot and change bid values both up and down throughout the slot to reflect the rapid changes in the market.
2. For years, most sidecars and relays have respected the builder’s latest bid, rather than selecting a stale bid that may be higher.
3. However, as changes are rolled out for ePBS and beacon nodes implement functionality from sidecars, [some](https://discord.com/channels/595666850260713488/1561889210032455730/1561889216214859858) [clients](https://discord.com/channels/595666850260713488/1561889210032455730/1561889216214859858) are [discussing](https://discord.com/channels/595666850260713488/1561889210032455730) absorbing the feature to request multiple bids per builder but to capture the highest instead of latest.
4. While it intuitively makes sense that a proposer wants to maximize their own profit and select the highest bid, this is a short-term game that will 1) lead to less profit for proposers, 2) create a divergence of yield when comparing well-resourced proposers vs under-resourced proposers, and 3) further centralize the builder market by increasing barriers to entry.
5. With this in mind, we strongly disagree with the direction some clients are moving and lay out our logic below.
6. If proposers can take the highest of all bids they receive per builder, builders will likely respond by shading or withholding bids to hedge against changes in market conditions.
7. This is the same way risk gets priced in nearly every market on Earth. A firm quote that has to stand while the market moves will be sniped if the opportunity and option exists, and any rational actor giving that firm quote will start to charge for that option through wider spreads. In this context, this means builders who have to provide a firm quote while markets move will offer less to proposers due to the additional risk they are underwriting.
8. Further, we have heard of this reducing pricing in practice. Historically, some validators forked or used software that allows them to select the highest bid and started to observe lower rewards or received warnings from builders that if they continued they would receive less / less competitive bids.
9. The result of this is:

    1. Proposer revenue decreases as builders bid less to cover the risk of market conditions changing after their bid is locked in.
    2. Larger staking operators who can coordinate directly with builders can and will create off-chain arrangements where they are trusted/legally compelled to respect cancellations and benefit from better bids, priced to the latest market. Less connected or resourced stakers obviously cannot benefit from this and will earn less and be at a significant disadvantage.
    3. A similar dynamic applies to builders, where incumbents can more easily make these agreements with large operators and bid higher on average compared to new builders who do not have these same connections and agreements. Further, for those proposers who still choose to take the highest bid within a slot, the ability to accurately price risk and time a withheld bid with network jitter, increases the sophistication required to be a profitable builder. Both in isolation and in combination these dynamics further increase the barrier to entry for new builders to compete or enter the market.

10. In conclusion, we strongly advocate that clients should be written to respect the latest bid per builder, not the highest, and we encourage proposers and responsible builders to advocate for this position.

## FAQ

1. Can’t a builder just bid once per slot, so it never needs to replace a bid?

    * Rather than send multiple shaded bids, builders can try to infer the final bid request and send a single bid as late as possible. If the bid is mistimed or there is network jitter, the bid can be missed and the proposer loses out. Recent features like bid streams improve robustness by streaming bids throughout the slot. If the default is select highest, bid streams would be relegated to the larger trusted staking operators rather than the smaller untrusted staking operators that benefit from robustness improvements the most.

2. Won’t a rational proposer modify client software to keep the highest anyway?

    * They can, and forking can’t be prevented, but proposers have been able to do this for years and mainstream software still keeps the latest. Modifying a sidecar takes effort and carries less risk to the network than forking a beacon node, and builders can respond to operators who do it. A client flag removes that effort for every operator.

3. Isn’t lowering a bid because an arbitrage didn’t go your way dishonest to proposers?

    * The latest bid is the builder’s honest bid, because the earlier one priced information that’s no longer true, and proposers earn more on average when builders can bid full value in every slot.

4. Can’t builders just leave out transactions they’re unsure about?

    * This is just another form of bid shading. If the block loses the value of those transactions, the proposer gets paid less, and searchers route the transactions to the builders with private agreements with large operators.

5. Highest per builder or total?

    * We're advocating that if you request multiple bids from a single builder to select the latest, but to take the highest cross all builders as sidecars do today.
