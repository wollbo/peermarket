// SPDX-License-Identifier: GPL-3.0
import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

pragma solidity ^0.8;


contract PeerMarket {

    address public owner;
    mapping (address => address) offers;
    mapping (address => bool) listed;
    mapping (address => bool) accepted;
    mapping (address => bool) purchased;
    mapping (address => bool) finished;

    constructor() {
        owner = msg.sender;
    }

    modifier offerOnly() { // potentially add to event functions
        require(offers[msg.sender] == msg.sender);
        _;
    }

    event contractListed(address offerAddress, address seller, uint offer, string fiat, string currency, uint oraclePayment);

    event contractAccepted(address offerAddress, address seller, address buyer, uint offer, string fiat, string currency);

    event contractPurchased(address offerAddress, address seller, address buyer, uint offer, string fiat, string currency, string paymentId);

    event contractFinished(address offerAddress, address seller, address buyer, uint offer, string fiat, string currency, string paymentId, string status);

    function listedToAccepted(address _seller, address _buyer, uint _offer, string memory _fiat, string memory _currency) public {
        require(listed[msg.sender] == true);
        listed[msg.sender] = false;
        accepted[msg.sender] = true;
        emit contractAccepted(msg.sender, _seller, _buyer, _offer, _fiat, _currency);

    }

    function acceptedToListed(address _seller, uint _offer, string memory _fiat, string memory _currency, uint _payment) public {
        require(accepted[msg.sender] == true);
        accepted[msg.sender] = false;
        listed[msg.sender] = true;
        emit contractListed(msg.sender, _seller, _offer, _fiat, _currency, _payment);

    }

    function acceptedToPurchased(address _seller, address _buyer, uint _offer, string memory _fiat, string memory _currency, string memory _paymentId) public {
        require(accepted[msg.sender] == true);
        accepted[msg.sender] = false;
        purchased[msg.sender] = true;
        emit contractPurchased(msg.sender, _seller, _buyer, _offer, _fiat, _currency, _paymentId);
    }

    function purchasedToFinished(address _seller, address _buyer, uint _offer, string memory _fiat, string memory _currency, string memory _paymentId, string memory _status) public {
        require(purchased[msg.sender] == true);
        purchased[msg.sender] = false;
        finished[msg.sender] = true;
        emit contractFinished(msg.sender, _seller, _buyer, _offer, _fiat, _currency, _paymentId, _status);
    }

    function newOffer(uint _offer, string memory _fiat, string memory _currency) public payable returns(address) {
        require(msg.value == _offer, "Offer must be supplied at creation");
        Escrow e = (new Escrow){value: _offer}(_offer, _fiat, _currency);
        offers[address(e)] = address(e);
        listed[address(e)] = true;
        uint _payment = e.getPayment(); // should be possible to do e.ORACLE_PAYMENT
        emit contractListed(address(e), tx.origin, _offer, _fiat, _currency, _payment);
        return address(e);
    }
}


contract Escrow is ChainlinkClient {
    using Chainlink for Chainlink.Request;
    LinkTokenInterface link;

    address public peermarket = msg.sender; // maybe move to constructor
    address payable public seller = payable(tx.origin);

    address public LINK_MATIC = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB; // first buyer has to approve spending to this LinkTokenInterface. NO TRANSACTIOn VALUE
    uint public ORACLE_PAYMENT = 1 * 10 ** 17;
    address public ORACLE = 0x11762F026FD049BE67badFCd8e278ceB8667663A;
    bytes32 JOB_ID = "8c288b5c462f4ad1bc5d9054c6e21482";

    uint public requests;
    uint public allowance;

    address payable public buyer;

    uint public offer;
    string public fiat;
    string public currency;

    uint public timer;
    uint public timeout = 1800; // Buyer has 30 minutes to initiate payment after accepting an offer
    // If buyer fails to initiate payment within this period, a portion of his deposited LINK gets slashed
    // If payment fails, also implement slashing
    uint public slash = 10; // 10% penalty for failing to initiate payment/failed payment
    // worst case scenario: buyer manages to send fiat but something goes wrong, somehow seller doesn't get paid and offer stay in escrow
    // buyers recourse: contac the bank and try to revoke the transaction
    //uint public expiration = 7776000; // in this stalemate, seller can wait 3 months for funds to unlock 
    // or if he and buyer manages to sort it out off chain, he can call confirm and release the funds

    string public paymentId;
    string public status;

    enum State {LISTED, ACCEPTED, PENDING, FINISHED} // Accepted and pending needs to be separate in order to avoid fiat double spends
    State public state;

    modifier buyerOnly() {
        require(msg.sender == buyer, "Only buyer can call this function");
        _;
    }

    modifier sellerOnly() {
        require(msg.sender == seller, "Only seller can call this function");
        _;
    }

    modifier oracleOnly() {
        require(msg.sender == ORACLE, "Only oracle can call this function");
        _;
    }

    constructor(uint _offer, string memory _fiat, string memory _currency) payable {
        require(msg.value == _offer);

        offer = _offer;
        fiat = _fiat;
        currency = _currency;
        link = LinkTokenInterface(LINK_MATIC);
        setChainlinkToken(LINK_MATIC);
    }

    function getPayment() public view returns (uint256){
        return ORACLE_PAYMENT;
    }

    //Buyer needs to interact directly with LinkTokenInterface outside of this smart contract and approve contract for spending
    function getAllowance() public view returns (uint256){ 
        return link.allowance(msg.sender, address(this));
    }

    function accept() public payable { // this step requires LINK payment (for later services) in order to avoid spoofing 
        require(state == State.LISTED);

        require(link.allowance(msg.sender, address(this)) >= ORACLE_PAYMENT, "Insufficient allowance");
        require(link.transferFrom(msg.sender, address(this), ORACLE_PAYMENT), "LINK payment failed");

        buyer = payable(msg.sender);
        timer = block.timestamp;
        state = State.ACCEPTED;
        PeerMarket pm = PeerMarket(peermarket);
        pm.listedToAccepted(seller, buyer, offer, fiat, currency);
    }

    function cancel() public buyerOnly {
        require(state == State.ACCEPTED || state == State.PENDING);
        
        if (timer + timeout > block.timestamp) { // return contract to listed if accept expires
            link.transfer(buyer, ORACLE_PAYMENT); // if buyer cancels in time he receives all of his tokens
        }
        else {
            link.transfer(buyer, (100-slash)*ORACLE_PAYMENT/100);
        }
        state = State.LISTED;
        PeerMarket pm = PeerMarket(peermarket);
        pm.acceptedToListed(seller, offer, fiat, currency, ORACLE_PAYMENT);
    }

    function relist() public sellerOnly { // Seller can choose to relist contract if accept timer expires
        require(state == State.ACCEPTED || state == State.PENDING);
        require(timer + timeout < block.timestamp);

        link.transfer(buyer, (100-slash)*ORACLE_PAYMENT/100);
        state = State.LISTED;
        PeerMarket pm = PeerMarket(peermarket);
        pm.acceptedToListed(seller, offer, fiat, currency, ORACLE_PAYMENT);
    }

    function purchase(string memory _paymentId) public buyerOnly { // figure out how to synk with off-chain Tink payment initiation
        require(state == State.ACCEPTED); // what happens if payment is initiated at breakpoint? 
        // solution: timer should be returned to front end; Tink payment should not be initiable within some error margin of timer
        // ex: timer to 30min, Tink payment can only be initiated for 25min, 5min "buffer"
        // shouldn't be a problem, Buyer gets redirected to main page with the paymentId and presses purchase
        // ideally, fiat payment should only be executed AFTER buyer has entered the payment ID into the smart contract!
        // accept contract --> create payment request --> purchase with payment id --> execute fiat payment
        PeerMarket pm = PeerMarket(peermarket);
        if (timer + timeout < block.timestamp) { // return contract to listed if accept expires
            link.transfer(seller, (100-slash)*ORACLE_PAYMENT/100);
            state = State.LISTED;
            pm.acceptedToListed(seller, offer, fiat, currency, ORACLE_PAYMENT);
        }
        else {
            paymentId = _paymentId;
            status = "CREATED"; // Tink Link hard codes payment to value stored in "fiat"
            state = State.PENDING; // Figure out when in the fiat payment scheme the fiat payment should be considered "sent"
            pm.acceptedToPurchased(seller, buyer, offer, fiat, currency, paymentId);
        }  
    }

    function requestPaymentStatus() buyerOnly public returns (bytes32 requestId) {
        require(state == State.PENDING);
        require(link.balanceOf(address(this)) >= ORACLE_PAYMENT, "Contract needs LINK funding");
        Chainlink.Request memory request = buildChainlinkRequest(JOB_ID, address(this), this.fulfill.selector);
        // Set the parameters for the bridge request
        request.add("paymentId", paymentId);
        request.add("fiat", fiat);
        request.add("currency", currency);
        // Sends the request
        return sendChainlinkRequestTo(ORACLE, request, ORACLE_PAYMENT);
    }
    
    function bytes32ToString(bytes32 _bytes32) public pure returns (string memory) {
        uint8 i = 0;
        while(i < 32 && _bytes32[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }

    /**
     * Oracle callback function
     */ 
    function fulfill(bytes32 _requestId, bytes32 _value) oracleOnly public recordChainlinkFulfillment(_requestId) {// try oracle only maybe it works
        status = bytes32ToString(_value); // if this takes too much gas from oracle, move it to paymentFulfilled require statement
        requests = requests + 1;
    } 

    function paymentFulfilled() buyerOnly public payable { // seller doesn't need to be able to call this function
        require(state == State.PENDING);
        require(requests > 0, "You need to request payment status first");
        require(keccak256(abi.encodePacked(status)) == keccak256(abi.encodePacked("SENT0000000000000000000000000000")), "Payment incomplete");

        buyer.transfer(address(this).balance);
        state = State.FINISHED;
        PeerMarket pm = PeerMarket(peermarket);
        pm.purchasedToFinished(seller, buyer, offer, fiat, currency, paymentId, status);
    }

    function confirm() sellerOnly public payable { // backup function; seller can choose to release funds if oracle fails
        require(state == State.PENDING);

        buyer.transfer(address(this).balance);
        state = State.FINISHED;
        PeerMarket pm = PeerMarket(peermarket);
        pm.purchasedToFinished(seller, buyer, offer, fiat, currency, paymentId, status);
    }

    function withdrawLink() public payable sellerOnly { // seller can withdraw extra LINK from slashing
        require(state == State.LISTED || state == State.FINISHED);
        link.transfer(seller, link.balanceOf(address(this)));
    }
}