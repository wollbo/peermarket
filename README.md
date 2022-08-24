# PeerMarket
A peer-to-peer crypto to fiat marketplace powered by open banking oracles

## Overview
On PeerMarket, users can trade crypto for fiat currencies peer-to-peer without having to trust each other or a centralized arbitror. Compared to similar platforms, 
PeerMarket removes the power assymmetry in favour of the seller in the transaction by delegating the role of determining payment fulfillment to a Chainlink oracle.
By integrating with an open banking platform, payments can be performed with several currencies and a multitude of banks in the European markets.

## Background
PeerMarket is the spiritual successor and culmination of the [tinklock](https://github.com/wollbo/tinklock) project, which was the first escrow smart contract to leverage open banking for settling peer-to-peer crypto to fiat asset exchange.

## Try it out!
The platform is available at https://peermarket-heroku.herokuapp.com/

## Instructions
The platform is currently live only on the Matic Mumbai PoS testnet, in order to buy and sell contracts you need testnet MATIC and LINK in your web3 wallet.
The landing page shows all of the credentials and logical flow in the sand box bank environment that the platform is using (no real fiat payments are involved).

### Creating an offer
In order to create an offer, navigate to the 'Listing' page through the header menu. First, authenticate to the platform and select your market through the drop down menu.
After a market has been selected, press the 'Verify account' button to access the Tink Link. This will take you to the external Tink authentication flow which is described in the 'Credentials' page.
If this sequence is successful, you should be redirected to a page with your successfully verified account verification id. Copy this id and navigate back to the PeerMarket Listing page.
Paste the id into the field with a bank icon below the 'Verify account' button and press the arrow button to the right. This will link your verified account credentials to your account in the PeerMarket database.
Update the page and you should see the account information of your verified user profile. Now you can enter an amount of MATIC to sell and the fiat amount of your currency that you want to be paid.
Press the 'Create' button and sign the transaction to complete the process. You can now find you offer in the 'Market' page.

### Claiming an offer
On PeerMarket, offers are first claimed before they can be purchased in order to avoid double spending of fiat payments. In order to avoid spoofing,
a prospective buyer must provide the LINK used for confirming payment to the Escrow contract as part of the claiming process. This means that the buyer when first pressing
'Purchase' on a contract will be prompted to set the oracle fee allowance for the contract to use his LINK, after this transaction is signed he can press 'Purchase' again,
which will move the contract to the 'ACCEPTED' state. Navigate to the 'Contracts' page in the header, and you will be able to find a list of your claimed, purchased and listed contracts.

### Tink Link payment flow
Accepted contracts are shown at the top of the 'Contracts' page. The buyer should select the market of the bank he is going to pay with from the market and can
then initiate the Tink Link flow by pressing the 'Tink Payment' button. This process is almost identical to verifying an account. After completing the authentication the buyer 
selects a sufficiently funded checkings account to perform the payment with in the required currency of the offer. After the payment is successful, the buyer is redirected
to a page where the id of his payment is stored in the url. The buyer copies this id and returns to the Contracts page, where he pastes the id into the input field with the bank logo.
When the input is correctly entered, he should press the arrow button to call the 'Purchase' function of the Escrow smart contract. When this is successful, the page may be updated and the offer
has now moved to the 'PURCHASED' state. If the buyer is unable to complete the payment before the timer expires (currently 30 minutes) a portion of his provided link is slashed and awarded to the seller, and the offer moves back to the market. 

### Tink oracle call and payout
Purchased contracts are shown below Accepted contracts on the 'Contracts' page. Pressing the 'Confirm Payment' triggers the Tink oracle to read the payment status of the provided payment id.
When a request has been successfully performed and the result returned to the smart contract, it is possible to press the 'Release Escrow' button. If the payment status reports a sent payment,
the funds are automatically paid out to the buyers wallet. If the payment is still pending, the buyer can refund the contract with the LINK oracle fee and press the 'Confirm Payment' button again.
As a backup, the seller can confirm that the payment has been received and manually release the funds from escrow.

## Architecture
The PeerMarket platform has several moving parts. The frontend is written in react, and the backend which communicates between frontend and the Tink platform is written with python and flask. The server is deployed on heroku, and users are authenticated through Moralis APIs. The Chainlink external adapter communicates with the Tink APIs using a python bridge hosted on AWS Lambda, and the node itself is a LinkPool NaaS. Moralis is also used to sync smart contract events with a database.

### Smart contracts
The smart contract stack of the platform is divided into a the PeerMarket master contract and the individual Escrow contracts generated by the sellers. The master contract provides functions for sellers to initiate Escrow contracts and callback functions for emitting events to the database. Sellers initiate Escrow contracts which provide the relevant contract information and holds the crypto funds during the transaction. Escrow contracts also communicate with the Tink payment APIs through the Chainlink oracle. An Escrow contract moves between the stages LISTED <-> ACCEPTED -> PURCHASED -> FINISHED, it is possible for contracts to move between LISTED and ACCEPTED continuously.

## Economics and viability
In order for the platform to be self sustaining and profitable the provided oracle fees must be able to cover infrastructure and development costs. Currently, as there is only one oracle operated by the same entity as the platform, all oracle payments would be allocated to the platform operations. The expenditures involved are oracle gas costs, open banking api licenses, chainlink node-as-a-service fees, database fees and server hosting fees.
In a production setting, you would want the chainlink nodes to be operated by teams unrelated to the platform in order to remove conflict of interests and vulnerabilities to centralized failures. This is readily facilitated by outsourcing the Tink oracle jobs to the market, each node operator would be provided with their own API keys to access the payment statuses. Thus, for a production setting an additional platform fee alongside the oracle payment would be introduced which would cover licensing and server fees. 

### Calculations
With the current set of providers, a minimal production version of the platform would incur an approximate cost of 74$ /month in infrastructure fees and 0.75$ /trade in licensing costs.
Assuming the platform handles 100 successful trades per month, the platform fee would have to be at least 0.75$ per trade to be net profitable. At a LINK price of 7$ this is equal to a fee of roughly 0.107 LINK per trade. This is close to the current oracle fee which is set at 0.1 LINK per call.
For the users, the main cost currently is paying for the network gas fees, but I expect its relevance to diminish as more and more scaling solutions and competing networks drive the transaction costs down over time. This would in practice mean that the seller pays virtually no fees in the transaction, while the buyer pays the platform and oracle fee, which in the current scenario amounts to less than 1.5$ per trade in total. This is very competitive, given that similar platforms charge fees of around 1% of the trade value for the escrow service, while providing inferior security guarantees for the buyers. Or from another view, it would be possible to significantly increase the platform fees while providing a superior and cheaper product compared to the existing alternatives currently on the market. In the same scenario, assuming an average price of 2000$ per offer and a flat 0.5% platform fee, the platform would make 925$ in profit per month.

## Future work and improvements
There are several improvements to be made to the platform as well as new features to be added:

### Improvements
- Implement more payment methods, currently only SEPA / Instant SEPA transfers are used
- Add a LINK/ETH DEX swap as part of the offer claim to remove the need for buyers to carry LINK
- Add support for selling ERC-20 Tokens and not only the native asset of the chain
- Support all major EVM networks on the same platform
- Add depositor contracts which allow sellers to sell an arbitrary amount of their assets at given prices
- Improve robustness of the platform, add multiple payment confirmation methods

### Future work
- Decentralize oracle infrastructure, outsource operation to the market
- Implement a LINK platform fee to cover infrastructure and development costs
- Implement more open banking providers to expand to other markets
- Enable cross chain payments using CCIP
- Eventually expand to being able to sell any asset whose delivery can be quantified and connected to an api
