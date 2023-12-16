let MissingReport = artifacts.require("./MissingReport.sol");


 contract("MissingReport", function(accounts){
   let missingReportInstance;


   it("initialize with two candidates", function(){
       return MissingReport.deployed()
       .then( function(instance){
           return instance.missingPersonCount()
       })
       .then( function( count ){
           assert.equal( count, 0 )
       });
   });
});