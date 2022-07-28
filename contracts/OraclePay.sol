// SPDX-License-Identifier: GPL-3.0
import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

pragma solidity ^0.8;


contract Escrow is ChainlinkClient {
    using Chainlink for Chainlink.Request;
    LinkTokenInterface link;

    address public LINK_MATIC = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB; // first buyer has to approve spending to this LinkTokenInterface. NO TRANSACTIOn VALUE
    uint public ORACLE_PAYMENT = 1 * 10 ** 17;
    address public ORACLE = 0x11762F026FD049BE67badFCd8e278ceB8667663A;
    bytes32 JOB_ID = "8c288b5c462f4ad1bc5d9054c6e21482";

    uint public requests;
    uint public allowance;

    address payable public seller;
    address payable public buyer;

    uint public offer;
    string public fiat;
    string public currency;

    uint public timer;
    uint public timeout = 1800; // Buyer has 30 minutes to initiate payment after accepting an offer
    // If buyer fails to initiate payment within this period, a portion of his deposited LINK gets slashed
    // If payment fails, also implement slashing
    uint public slash = 10; // 10% penalty for failing to initiate payment/failed payment

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

        seller = payable(msg.sender);
        offer = _offer;
        fiat = _fiat;
        currency = _currency;
        link = LinkTokenInterface(LINK_MATIC);
        setChainlinkToken(LINK_MATIC);

    }

    //Buyer needs to interact directly with LinkTokenInterface outside of this smart contract and approve contract for spending
    function getAllowance() public view returns (uint256){ 
        return link.allowance(msg.sender, address(this));
    }

    function accept() public payable { // this step requires LINK payment (for later services) in order to avoid spoofing 
        require(state == State.LISTED);

        require(link.allowance(msg.sender, address(this)) >= ORACLE_PAYMENT, "Insufficient allowance");
        require(link.transferFrom(msg.sender, address(this), ORACLE_PAYMENT), "Payment failed");

        buyer = payable(msg.sender);
        timer = block.timestamp;
        state = State.ACCEPTED;
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
    }

    function relist() public sellerOnly { // Seller can choose to relist contract if accept timer expires
        require(state == State.ACCEPTED || state == State.PENDING);
        require(timer + timeout < block.timestamp);

        link.transfer(buyer, (100-slash)*ORACLE_PAYMENT/100);
        state = State.LISTED;
    }

    function purchase(string memory _paymentId) public buyerOnly { // figure out how to synk with off-chain Tink payment initiation
        require(state == State.ACCEPTED); // what happens if payment is initiated at breakpoint? 
        // solution: timer should be returned to front end; Tink payment should not be initiable within some error margin of timer
        // ex: timer to 30min, Tink payment can only be initiated for 25min, 5min "buffer"
        // shouldn't be a problem, Buyer gets redirected to main page with the paymentId and presses purchase
        // ideally, fiat payment should only be executed AFTER buyer has entered the payment ID into the smart contract!
        // accept contract --> create payment request --> purchase with payment id --> execute fiat payment
        if (timer + timeout < block.timestamp) { // return contract to listed if accept expires
            link.transfer(seller, (100-slash)*ORACLE_PAYMENT/100);
            state = State.LISTED; 
        }
        else {
            paymentId = _paymentId;
            status = "CREATED"; // Tink Link hard codes payment to value stored in "fiat"
            state = State.PENDING; // Figure out when in the fiat payment scheme the fiat payment should be considered sent¨
            // MAKE sure that fiat payment can NOT be spent if timer times out
        }  
    }

    function requestPaymentStatus() buyerOnly public returns (bytes32 requestId) {
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
    function fulfill(bytes32 _requestId, bytes32 _value) public recordChainlinkFulfillment(_requestId) {
        status = bytes32ToString(_value); // if this takes too much gas from oracle, move it to paymentFulfilled require statement
        requests = requests + 1;
    }

    function paymentFulfilled() public payable {
        require(state == State.PENDING);
        require(requests > 0);
        require(keccak256(abi.encodePacked(status)) == keccak256(abi.encodePacked("SENT0000000000000000000000000000")));

        buyer.transfer(address(this).balance);
        state = State.FINISHED;
    }

    function withdrawLink() public payable sellerOnly { // seller can withdraw extra LINK from slashing
        require(state == State.LISTED || state == State.FINISHED);
        link.transfer(seller, link.balanceOf(address(this)));
    }
} 