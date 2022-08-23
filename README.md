# PeerMarket
A peer-to-peer crypto to fiat marketplace powered by open banking oracles

## Overview
On PeerMarket, users can trade crypto for fiat currencies peer-to-peer without having to trust each other or a centralized arbitror. Compared to similar platforms, 
PeerMarket removes the power assymmetry in favour of the seller in the transaction by delegating the role of determining payment fulfillment to a Chainlink oracle.
By integrating with an open banking platform, payments can be performed with several currencies and a multitude of banks in the European markets.

## Try it out
The platform is available at https://peermarket-heroku.herokuapp.com/

## Instructions
The platform is currently live only on the Matic Mumbai PoS testnet, in order to buy and sell contracts you need testnet MATIC and LINK in your web3 wallet.
The landing page shows all of the credentials and logical flow in the sand box bank environment that the platform is using (no real fiat payments are involved).

### Creating an offer
In order to create an offer, navigate to the 'Listing' page through the header menu. First, authenticate to the platform and select your market through the drop down menu.
After a market has been selected, press the 'Verify account' button to access the Tink Link. This will take you to the external Tink authentication flow which is described in the 'Credentials' page.
Select 'Tink Demo Bank' -> 'Open Banking' -> 'Password and OTP' -> Fill in Seller credentials for your market and select 'Text input' as OTP method -> Fill in OTP code displayed below input -> Select a Checking account to verify
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

### Smart contracts

### Tink oracle

## Economics

## Future work
