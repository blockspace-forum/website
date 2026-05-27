---
title: "Towards Multi-Party Block Construction"
authors: "Michael M., Kubi M., Alex T., Drew V."
date: "May 2026"
subtitle: "Moving from one monolithic builder per block to multi-party blocks assembled from the contributions of multiple builders, widening blockspace allocation to their shared view."
---

*Co-authored by [Michael M.](https://x.com/mostlyblocks), [Kubi M.](https://x.com/kubimensah), [Alex T.](https://x.com/alextes), and [Drew V.](https://x.com/DrewVdW)*

*Special thanks to [Jason V.](https://x.com/jasnoodle), [George D](https://x.com/gd_gattaca)., [Thomas T.](https://x.com/soispoke), [Barnabe M.](https://x.com/barnabemonnot), [Justin D](https://x.com/drakefjustin)., [Quasar Builder](https://x.com/QuasarBuilder), [Max W.](https://x.com/0xKuDeTa), and [Davide R.](https://x.com/0xseiryu) for their comments and review.*

### **TL;DR**

- Today's transaction pipeline has structural gaps that multiple teams and the community have worked to address.
- Building on workshops and conversations with teams across Ethereum, this post introduces multi-party block construction (MPBC), a fundamental redesign of how transactions find blocks and blocks get constructed.
- MPBC moves from one monolithic builder per block to multi-party blocks assembled from the contributions of multiple builders, widening blockspace allocation to their shared view.
- The design starts to address structural gaps, improves the robustness of Ethereum, and better matches the supply and demand of blockspace by allowing transactions unknown to or filtered by individual builders to find inclusion.
- This design is a first iteration. There are remaining gaps and open questions which we look forward to continuing to address with the teams that have already contributed and the wider Ethereum community.
- See the [ethresearch post](https://ethresear.ch/t/building-towards-multi-party-block-construction/24975)

## Background

The Blockspace Forum is a gathering of industry participants with the purpose of improving the transaction journey on Ethereum. The most recent iteration was held in Cannes in April 2026, bringing together 32 teams, including block builders and relays accounting for more than 95% of all blocks constructed out of protocol. A detailed recap of the workshop [can be accessed here](/learn/events/cannes-2026.html).

The goal of the Cannes workshop was to explore solutions to the structural gaps in the transaction pipeline identified at the preceding Buenos Aires iteration of the Forum. These gaps limit the economics, robustness, performance, and service compatibility of blockspace, imposing an opportunity cost on transaction originators, builders, infrastructure providers like relays, and validators. A detailed description of these challenges is [available here](https://ethresear.ch/t/an-observation-on-ethereum-s-blockspace-market/23669).

This post introduces Multi-Party Block Construction (MPBC), which allows multiple parties to contribute to a single block. The design is strictly additive, extending blockspace allocation from a single builder’s limited view to the shared view of multiple builders. These multiple inclusion lanes allow transactions to find inclusion even when they are not available to or filtered by individual builders. This redesign aims to better match blockspace supply and demand, and starts to address the transaction pipeline’s structural gaps. 

MPBC is based on the Cannes and Buenos Aires workshops, and research and conversations across the Ethereum ecosystem. We expect the initial design to evolve in collaboration with the community, including the many parties that have already contributed to the Blockspace Forum and related research. We welcome feedback, and look forward to continuing the conversation here, and [on X](https://x.com/blockspaceforum). 

This post assumes familiarity with proposer-builder separation and the structural gaps in Ethereum’s current transaction pipeline.  A primer covering both is available [here](/learn.html#intro-to-blockspace).  

### The Current Solution Landscape

The Blockspace Forum workshops surveyed several active approaches to improving out-of-protocol block construction. These complement each other to address different originator preferences: 

- [BuilderNet](https://buildernet.org/) (Flashbots, Beaverbuild, Nethermind) uses TEEs to reduce trust assumptions and enable shared order flow.
- [TOOL / Nuconstruct](https://x.com/0x9212ce55/status/1970857263314448603) targets sub-slot-driven early execution confirmations with an open collaborative environment.
- [ETHGas](https://docs.ethgas.com/) explores crypto-economically backed preconfirmations and futures to price inclusion risk and smooth fees. ETHGas also supports sub-blocks.
- [mev-commit](https://www.mev-commit.xyz/) develops preconfirmations and block positioning bids for inclusion**.**

MPBC aims to allow collaborative block building across these and other new solutions, and centralized block builders. This initial design expands on earlier proposals including [relay block merging](https://ethresear.ch/t/relay-block-merging-boosting-value-censorship-resistance/22592), [relay inclusion lists](https://ethresear.ch/t/relay-inclusion-lists/22218), and [multi-relay inclusion lists](https://ethresear.ch/t/block-constraints-sharing-multi-relay-inclusion-lists-beyond/22752). 

### Terminology

This document uses the following terms throughout. 

| **Term** | **Explanation** |
| --- | --- |
| Proposer-Builder Separation (PBS) | A mechanism adopted by the Ethereum community that preserves validator decentralization by outsourcing block construction to a specialized monolithic builder market. |
| Multi-Party Block Construction (MPBC) | A mechanism through which multiple parties contribute to blocks, creating independent inclusion paths and widening blockspace allocation to their shared view. |
| Single-Party Block | A block containing transactions contributed by only one monolithic builder.  |
| Multi-Party Block | A block containing transactions contributed by more than one party.  |
| Base Block | A highest-bid single-party block available to an operator, used as the starting point for multi-party block construction. |
| Proposer (Validator) | A stakeholder that stakes ETH and performs various operations to support the Ethereum network including attesting, producing, and signing Ethereum blocks. |
| Originator | A stakeholder that transacts and consumes Ethereum blockspace. Examples include sending a stablecoin, trading on a DEX, or an L2 submitting a blob. |
| Builder | A sophisticated party responsible for optimizing how transactions find blocks and blocks get constructed.  |
| Base Builder | The builder that constructed the base block.   |
| Contributing Builders | Builders that have contributed transactions to a multi-party block. |
| Relay | A required intermediary under PBS that escrows and relays the highest-bid block constructed by a single builder to the proposer. |
| Operator | A party that receives blocks and transactions from builders, combines eligible contributions into a multi-party block, and submits the highest-paying block to the proposer.  |

## An Initial Design of Multi-Party Block Construction

MPBC extends PBS by allowing the highest-bid single-builder block to be improved with eligible contributions from other builders. The figures below compare today’s pipeline with the initial MPBC design.

**The current PBS block construction pipeline**

![Schematic illustration of the current PBS block construction pipeline. ](../assets/research/current-pbs-pipeline.png)


*Figure 1: Schematic illustration of the current PBS block construction pipeline.* 

The current block construction pipeline connects the single builder that has submitted the highest-bid block to the proposer. Only transactions available to the winning builder can find inclusion through this single lane, including service transactions like proposer commitments. 

**The MPBC block construction pipeline**

![Schematic illustration of the MPBC pipeline](../assets/research/mpbc-pipeline.png)

*Figure 2: Schematic illustration of the MPBC pipeline.* 

Under MPBC transactions and service commitments absent from the base block can still be included in the current slot. Each slot proceeds as follows:

1. Originators submit transactions to builders and to the mempool. 
2. Builders construct single-party blocks from their local transaction view, submit those blocks to operators, and indicate which blocks and transactions are eligible for MPBC.
3. Operators extend the highest-bid single-party block with non-conflicting transactions submitted by competing builders. 
4. Operators compare the multi-party block to the highest-bid single-party block at delivery time, and submit the overall highest-paying block to the proposer. 
5. The proposer signs the highest-paying block header received across all operators.

MPBC is facilitated by multiple competing operators. Operators receive blocks and transactions from builders, identify eligible transactions absent from the base block, and append them to produce a higher-value multi-party block.

Operator competition is initially focused on appending eligible transactions. Over time, it may extend to bid cancellations, payload propagation, and other services that improve block delivery and transaction inclusion. In the long term, this incentivizes operators to develop proprietary implementations including custom software and independent infrastructure, reducing the risk of correlated failures.

Operators may also elect to deploy TEE-based instances or other verifiability mechanisms to reduce trust assumptions, allowing them to carry forward the privacy guarantees issued by TEE-based builders. This hybrid approach allows reconciliation of blocks built within and outside TEEs, combining verifiable privacy guarantees with MPBC.

**The impact of MPBC**

The following table summarizes the core properties and impact of both pipelines: 

| ***Dimension*** | ***Single-Party Block Construction*** | ***Multi-Party Block Construction*** |
| --- | --- | --- |
| **Parties contributing to blocks** | One winning builder. | One base builder and any number of contributing builders. |
| **Transactions eligible for inclusion** | Transactions known to the winning builder. | Transactions known to the base builder and contributing builders.  |
| **Inclusion Paths** | Through the winning builder.  | Through the base builder and other contributors. |
| **Support for Services** | Proposer commitments and other services rely on opt-in by the winning builder for inclusion.  | Proposer commitments and other services can be included by the base builder or a contributing builder. |
| **Performance and UX** | Transactions not known to the winning builder spill-over to future slots. Users defensively overbid for inclusion. | Transactions by any builder can find inclusion. Higher utilization and more predictable inclusion can reduce defensive overbidding. Better service support accommodates heterogeneous user needs, such as early inclusion confirmations.   |

The design affects the actors in the block construction pipeline in the following ways: 

- Originators see faster, cheaper, and more predictable inclusion through additional inclusion paths and higher blockspace utilization.
- Builders gain revenue for every block they contribute transactions to, lowering the barrier to entry for new builders.
- Operators earn revenue proportional to the value they generate by adding transactions from contributing builders to the base block.
- Proposers receive more valuable blocks and gain more credible support for proposer services, since multiple builders can contribute transactions.
- The Ethereum protocol benefits from higher censorship resistance and robustness through multiple inclusion channels, improved economics through higher blockspace utilization, and better support for services.

MPBC is largely implemented by operators and builders, and requires no Ethereum protocol changes. Originators and proposers face no additional requirements unless they opt into services such as preconfirmations. The design does not rely on relays, as their core escrow role has been replaced by ePBS, which handles trusted handoff for single-party blocks in protocol. In contrast to relays, operators are not required and will only see usage when their services improve block value.

**MPBC and the Structural Gaps of the PBS Pipeline**

The following table summarizes MPBC’s impact on the economics, robustness, performance, and service-support problems of the single-party block construction pipeline:

| ***Dimension*** | ***Single-Party Block Construction*** | ***Multi-Party Block Construction*** |
| --- | --- | --- |
| **Economics** | • Price discovery limited to a single builder's view of transactions.  
• No compensation for key actors.  
• No support for forward markets, leaving users exposed to gas volatility. | • Price discovery over multiple builders’ views of transactions.   
• Operator compensation proportional to value generation.   
• Forward markets enabled through multiple inclusion paths for advance commitments. |
| **Robustness** | • Concentrated builder and relay set due to winner-take-all dynamics.   
• Single builder holds discretion over inclusion.   
• Limited proposer agency. | • More diverse builder and operator set by allowing multiple parties to contribute to blocks.   
• Multiple inclusion channels.   
• Higher proposer agency due to support for proposer services. |
| **Performance** | • Transaction spill-over when capacity is constrained.   
• Latency variance due to global auction. | • Transactions not known to the base builder can be included instead of spilling over into subsequent slots.   
• Coordinated auctions reduce latency variance. |
| **Services** | • Service support requires opt-in by the winning builder.   
• High opportunity cost of forgoing opt-in by any competitive builder. | • Service transactions can be included by the base builder, or by contributing builders.   
•  Operators collect and share block constraints with builders. 
• Small builders may specialize to support many service protocols.  |

### MPBC Mechanism

Operators append eligible transactions from contributing builders to the highest-bid single-party block. At delivery time, they compare the resulting multi-party block against the latest highest-bid single-party block and deliver the higher-paying of the two to the proposer.

The mechanism’s value scales with decentralization and the number of builders participating in it. The more fragmented transaction flow is among builders, the less encompassing the execution guarantees any individual builder can provide. If the base builder has not issued execution guarantees for some state, it can be accessed by merged transactions. 

The initial scope is limited to transactions that do not compete for contentious state, such as simple transfers or self-contained transaction bundles. This enables fast append-only merging while preserving the execution guarantees of the base block.

Future iterations may expand this scope to include oracle updates, active enforcement of proposer services such as preconfirmations, additional operator coordination, and networking improvements.

#### Implementation

Operators extend the base block by appending missing service transactions such as proposer commitments, followed by other eligible transactions that increase block value, and transactions that distribute the newly added surplus. The mechanism unfolds in two stages, merging and delivery.

The value unlocked per-block corresponds to the difference between the value of the multi-party block $B_{\text{MP}}$ and the value of the single-party block $B_{\text{SP}}$:

$$
\Delta V_{\text{block}}=\text{val}(B_{\text{MP}}) - \text{val}(B_{\text{SP}})
$$

Operators improve the value of the highest-bid single-party block, even if a combination of multiple other blocks could be more valuable. This prevents builders from spamming blocks containing subsets of the best block to improve their chances of inclusion. 

As multiple builders contribute transactions, the surplus available for distribution is calculated on a per-transaction basis. When several builders contribute the same transaction, it is attributed to the builder with the higher PBS auction bid, incentivizing competitive bidding. The exact value distribution rule is in active discussion and a topic for future research. 

**Merging Stage**

The merging stage commences whenever an operator has received blocks and transactions eligible for merging. To avoid burdening originators with unexpected latency or inclusion, builders decide which blocks can be extended, and which transactions can be added to other blocks. These flags are submitted with the block’s metadata. Once a builder allows a block to be extended, transaction selection is performed by the operator according to the merging rules.

Operators execute the following steps: 

1. Operators identify constraints from the complete set of constraints $C$ that are absent in the highest-bid single-party block $B_{\text{SP}}$:
$$
C_{\text{missing}} = \{\text{tx} \in C \mid \text{tx} \notin B_{\text{SP}}\}
$$
2. Operators attempt to merge these constraint transactions into $B_{\text{SP}}$. If this cannot be accomplished without changing the execution guarantees of $B_{\text{SP}}$, it is discarded, the second-highest-bid single-party block is designated $B_{\text{SP}}$, and the operator returns to step 1. 
3. For the highest-bid block $B_i$ of each opted-in builder $i$, the operator identifies the eligible transactions absent in $B_{\text{SP}}$:
$$
\text{Txns}_{i/\text{SP}} = \{ \text{tx} \in B_i \mid \text{tx} \notin B_{\text{SP}}\}
$$
4. The operator merges from $\text{Txns}_{i/\text{SP}}$ into $B_{\text{SP}}$, filtering out any transactions that would revert, creating the multi-party block $B_{\text{MP}}$.
5. The operator calculates the surplus of the multi-party block $B_{\text{MP}}$ and appends any distribution transactions. 

**Delivery Stage**

The delivery stage commences when an operator has finalized the multi-party block, which is then compared to the highest-bid single-party block available at delivery time. The highest-paying block is delivered to the proposer. This ensures that the mechanism improves on the bid floor set by the PBS auction.

Operators execute the following steps: 

1. The operator checks for the presently highest-bid single-party block $\hat{B}_{\text{SP}}$. 
2. The operator verifies the improvement in blockspace utilization and block value by comparing $B_{\text{MP}}$ against the maximum value of $B_{\text{SP}}$ and $\hat{B}_{\text{SP}}$:

$$
\Delta V = \text{val}(B_{\text{MP}}) - \max(\text{val}(B_{\text{SP}}), \text{val}(\hat{B}_{\text{SP}}))
$$

1. If $\Delta V \geq 0$ the operator returns the header of $B_{\text{MP}}$ to the proposer and splits the surplus as per the value distribution rule; otherwise, it falls back to the highest-bid single-party block.

### Networking and Coordination

The merging mechanism operates within the constraints of the information available to individual operators, and the expected propagation latency to the proposer. Operators can coordinate to improve block value without conceding their competitive edge by sharing information that increases the expected time horizon and accuracy of block construction. This is incentive compatible as operator compensation is expected to scale with the value generated. 

Initially, operators may share the following categories of information with each other: 

- Constraints: Sharing block constraints like proposer commitments at the start of the slot lets multiple operators verify their inclusion and inform builders of block requirements.
- Geolocation: Coordinating around the proposer’s geography at the start of the slot allows conducting the block auction close to the proposer, reducing latency variance, and increasing the expected block value of geographically distant proposers.
- Payloads: Sharing execution payloads at the conclusion of the slot allows operators to combine their geographic coverage for more efficient propagation to attesters.
- Demotions: Sharing information on builder demotions throughout the slot allows operators to enforce a consistent view of which builders are temporarily excluded, reducing the need for builders to post separate collateral with each operator.

## Outlook

The MPBC design described in this post builds on the discussion at the Buenos Aires and Cannes Blockspace Forum workshops, and will continue to evolve as teams implement and test the system in production. Feedback from all teams in the block construction pipeline is welcome and will be actively solicited as the design matures. 

**Open Questions and Future Directions**

Specific open questions and limitations include: 

- Value Distribution: The exact distribution mechanism for the new value contributed under MPBC, which should increase the revenue of all actors in the block construction pipeline.
- Trusted Operators: Ways to reduce trust assumptions through additional mechanisms including economic and consensus-based systems, or technical solutions like TEEs or FHE.
- Transaction Coverage: Extensions to the MPBC mechanism that allow builders to contribute additional categories of transactions to the base block, such as contentious transactions or oracle updates.
- Active Service Enforcement: The option for operators to append service transactions like proposer commitments even when builders have failed to include them.
- Technical improvements: Upgrades to technical infrastructure including network connectivity and peer-to-peer implementations.

MPBC can be scaled through [sub-slots](/learn/events/cannes-2026.html), which allow for more frequent multi-builder contributions and fast execution preconfirmations. This improves blockspace allocation by clearing demand at higher cadence, and robustness by giving each transaction multiple inclusion attempts within a single slot. Sub-slots were discussed at the Cannes Blockspace Forum workshop and are a direction for more detailed exploration.

The initial design presented in this post is a first step towards multi-party block construction, building on the discussions and contributions of teams across the Ethereum ecosystem. Forthcoming publications will complement this introductory design with technical specifications, and address gaps like value distribution and trust assumptions. The Blockspace Forum will return later this year, and we look forward to seeing everybody there.

[*Continue the discussion on ethresear.ch.*](https://ethresear.ch/t/building-towards-multi-party-block-construction/24975)
