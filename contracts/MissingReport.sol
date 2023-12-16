// SPDX-License-Identifier: GPL-3.0



pragma solidity >=0.7.0 <0.9.0;

contract MissingReport {
    event postedReportEvent( 
        string name,
        uint age,
        uint height,
        string status,
        string description,
        string division,
        string relativeContactNo
    );

    // model a candidate
    struct MissingPersonInfo {
        string name;
        uint age;
        uint height;
        string status; //(either “missing” or “found”),
        string description;
        string division;// from where the person got missing
        string relativeContactNo;
       
   }

    

    // missingPersonCount according to 8 divisions:
    mapping ( string => uint ) public divisionCount;


   // store missingPerson count
    uint public missingPersonCount;  // Total
    mapping( string => bool ) private divisions;  //Divisionally

    mapping( string => bool) private keyChecker;


    // Read/write missingPersonInfo
    mapping( string => MissingPersonInfo) public divisionalMissingReport;
    
    string private key;


    string[] public divisionNames = ["Dhaka", "Chittagong", "Khulna", "Rajshahi", "Sylhet", "Comilla", "Rangpur", "Narsingdi"];



    // Constructor
    constructor() {
        divisions[ divisionNames[0] ]=true;
        divisions[ divisionNames[1] ]=true;
        divisions[ divisionNames[2] ]=true;
        divisions[ divisionNames[3] ]=true;
        divisions[ divisionNames[4] ]=true;
        divisions[ divisionNames[5] ]=true;
        divisions[ divisionNames[6] ]=true;
        divisions[ divisionNames[7] ]=true;
        missingPersonCount = 0;
    }

    

    // adding missingPerson
    function addMissingPerson( 
                                string memory _name, 
                                uint _age, 
                                uint _height, 
                                string memory _status, 
                                string memory _description, 
                                string memory _division, 
                                string memory _relativeContactNo
                            ) public {
        
        require( divisions[_division] );
        
        

        key = keyConcat(_division,_name);
        require( !keyChecker[key]);
        missingPersonCount++;
        divisionCount[_division]++;
        divisionalMissingReport[key] = MissingPersonInfo( _name, _age, _height, _status, _description, _division, _relativeContactNo);
        // MissingPersonInfo memory latestInfo = divisionalMissingReport[key];
        keyChecker[key] = true;

        emit postedReportEvent(_name, _age, _height, _status, _description, _division, _relativeContactNo);
    }















    function keyConcat(string memory a, string memory b) internal pure returns (string memory) {

        return string(abi.encodePacked(a, "-", b));
// https://ethereum.stackexchange.com/questions/729/how-to-concatenate-strings-in-solidity
    }
}
