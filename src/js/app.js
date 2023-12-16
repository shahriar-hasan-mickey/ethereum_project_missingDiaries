// counter = 0

App = {
  webProvider: null,
  contracts: {},
  account: '0x0',
 
 
  init: function() {
    return App.initWeb();
  },
 
 
  initWeb:function() {
    // if an ethereum provider instance is already provided by metamask
    const provider = window.ethereum
    if( provider ){
      // currently window.web3.currentProvider is deprecated for known security issues.
      // Therefore it is recommended to use window.ethereum instance instead
      App.webProvider = provider;
    }
    else{
      $("#loader-msg").html('No metamask ethereum provider found')
      console.log('No Ethereum provider')
      // specify default instance if no web3 instance provided
      App.webProvider = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    }
 
 
    return App.initContract();
  },
 
 
  initContract: function() {
    $.getJSON("MissingReport.json", function( MissingReport ){
      // instantiate a new truffle contract from the artifict
      App.contracts.MissingReport = TruffleContract( MissingReport );
 
 
      // connect provider to interact with contract
      App.contracts.MissingReport.setProvider( App.webProvider );
 

      App.listenForEvents();
 
      return App.render();
    })
  },
 
 
  render: async function(event){
    
    var missingReportInstance;
    var loader = $("#loader");
    var content1 = $("#content1");
 
 
    loader.show();
    content1.hide();

    // counter += 1;
    // console.log("counter", counter);
    // console.log("event", event);
    // load account data
    if (window.ethereum) {
      try {
        // recommended approach to requesting user to connect metamask instead of directly getting the accounts
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        App.account = accounts;
        $("#accountAddress").html("Your Account: " + App.account);
      } catch (error) {
        if (error.code === 4001) {
          //  code 4001 === User rejected request
          console.warn('user rejected')
        }
        console.error(error);
      }
    }
 
 
    //load contract data
    App.contracts.MissingReport.deployed()
    .then( function( instance ){
      missingReportInstance = instance;
      return missingReportInstance;
    }) 
    .then( function( missingReportInstance ){
      
      var missingCount = $("#missingCount");
      var missingCountHead = $("#missingCountHead");
      missingCountHead.empty();
      missingCount.empty();

      var countArr = {};

      for (let i = 0; i <= 7; i++) {
        missingReportInstance.divisionNames(i).
        then((divisionName)=>{
          
          missingReportInstance.divisionCount(divisionName)
            .then((count)=>{

              countArr[divisionName] = count.c[0];

              // console.log("count",countArr)
              
              if(i == 7){

                // console.log("countArr", Object.entries(countArr).sort((a, b) => a[1] - b[1]));
                countArr = Object.entries(countArr).sort((a, b) => a[1] - b[1]);
                // console.log(countArr)
                // https://medium.com/@gmcharmy/sort-objects-in-javascript-e-c-how-to-get-sorted-values-from-an-object-142a9ae7157c

                missingReportInstance.missingPersonCount().
                  then((totalCount)=>{

                    var missingCountHeadTemplate = "<tr>";
                    var missingPersonCountTemplate = "<tr>";

                    for (let j = 0; j <= 7; j++) {
                      missingCountHeadTemplate += "<th>" + countArr[j][0] + "</th>";
                      missingPersonCountTemplate += "<td>" + countArr[j][1] + "</td>";
                    }
                    missingCountHeadTemplate += "<th>" + "Total Count" + "</th>";
                    missingPersonCountTemplate += "<td>" + totalCount + "</td>";

                    var median = (countArr[8/2][1] + countArr[(8/2) + 1][1]) / 2;
                    
                    missingCountHeadTemplate += "<th>" + "Median Count" + "</th>";
                    missingPersonCountTemplate += "<td>" + (median) + "</td>";

                    missingCountHeadTemplate += "</tr>";
                    missingPersonCountTemplate+="</tr>";

                    missingCountHead.append( missingCountHeadTemplate );
                    missingCount.append( missingPersonCountTemplate );

                    console.log(missingCountHead, missingCount);
                  });
              }
            });
          
        });
      }

      
     
      loader.hide();
      content1.show();

      
      
    })
    .catch( function( error ){
      console.warn( error );
    });
  },






 // Adding Report
  writeMissingReport: function(){
    
    let name = $("#name").val();
    let age = $("#age").val();
    let height = $("#height").val();
    let status = $("#status").val();
    let description = $("#description").val();
    let division = $("#division").val();
    let emergencyNo = $("#contactNo").val();

    console.log(name, age, height, status, description, division, emergencyNo);
    
    App.contracts.MissingReport.deployed()
    .then( function( instance ){
      return instance.addMissingPerson( name, age, height, status, description, division, emergencyNo, { from: App.account[0] } )
    })
    .then( function( result ){
      // wait for voters to update vote
      console.log(result)
    //     // content.hide();
    //     // loader.show();
        alert("You have filed missing report successfully");

        // App.lastPostedReport(name, division);
    })
    .catch( function( err ){
      console.error( err )
    } )
  },


  searchMissingPersonInfo: ()=>{
    var content2 = $("#content2");
    var loader = $("#loader");
    content2.hide();
    loader.show();

    let searchName = $('#searchName').val();
    let searchDivision = $('#searchDivision').val();
    console.log(searchName, searchDivision);

    App.contracts.MissingReport.deployed()
    .then((instance)=>{

      let key = searchDivision + "-" + searchName;
      console.log(key);

      return instance.divisionalMissingReport(key);
    }).then((result)=>{
      

      var missingCandidatesResults = $('#missingCandidatesResults');
      missingCandidatesResults.empty();


      var name = result[0];
      var age = result[1];
      var height = result[2];
      var status = result[3];
      var description = result[4];
      var division = result[5];
      var contactNo = result[6];

      
      // content2.
      console.log(result);

      var missingCandidatesResultsTemplate =  "<tr><td>" + name + "</td><td>" + age + "</td><td>" + height + "</td><td>" + status + "</td><td>" + description + "</td><td>" + division + "</td><td>" + contactNo + "</td></tr>";

      missingCandidatesResults.append(missingCandidatesResultsTemplate);

      loader.hide();
      content2.show();
      

    }).catch((errorMessage)=>{
      console.error(errorMessage);
    })
  },



  onReceivedEvent: ( args )=>{
      let loader = $("#loader")
      let content3 = $("#content3");
      content3.hide();
      loader.show();

      let missingPersonName =  args.name;
      let missingPersonAge =  args.age.c[0];
      let missingPersonHeight = args.height.c[0];
      let missingPersonStatus = args.status;
      let missingPersonDescription = args.description;
      let missingPersonDivision = args.division;
      let missingPersonRelativeContactNo = args.relativeContactNo;

      let missingPost = $("#missingPost");
      missingPost.empty();

      
      var missingPostTemplate = "<tr><td>" + missingPersonName + "</td><td>" + missingPersonAge + "</td><td>" + missingPersonHeight + "</td><td>" + missingPersonStatus + "</td><td>" + missingPersonDescription + "</td><td>" + missingPersonDivision + "</td><td>" + missingPersonRelativeContactNo + "</td></tr>";

      missingPost.append(missingPostTemplate);


      loader.hide();
      content3.show();
    },



  // voted event
 listenForEvents: function(){
  App.contracts.MissingReport.deployed()
  .then( function( instance ){
    instance.postedReportEvent({}, {
      fromBlock: 0,
      toBlock: "latests"
    })
    .watch( function( error, event ){
      console.log("Triggered", event);
      
      // reload page
      App.onReceivedEvent(event.args);
      App.render();


    });
  });
}

 };
 
 
 $(function() {
  $(window).load(function() {
    App.init();
  });
 });



 
 