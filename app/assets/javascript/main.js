// {
//  "Details": {
//    "Parameters": {
//            "nhs_id": 9658499805
//    }
//  }
// }

// or


// CASE SENSITIVE NAMES
// {
//  "Details": {
//    "Parameters": {
//      "firstname": "Stan",
//      "surname": "VOS"
//    }
//  }
// }


$('.btn-preset').click(function() {

	if($(this).attr('nhsid')){
		var nhsid = $(this).attr('nhsid');
		var data = "{\n \"Details\": {\n   \"Parameters\": {\n           \"nhs_id\": "+nhsid+"\n   }\n }\n}"

		$('#form-patient-details').trigger("reset");
		$('#nhs_id').val($(this).attr('nhsid') );
		callApi(data);
	}

	if($(this).attr('firstname')){
		var firstname = $(this).attr('firstname');
		var surname = $(this).attr('surname');
		var data = "{\"Details\": {\"Parameters\": {\"firstname\": \""+firstname+"\", \"surname\": \""+surname+"\"} } }"
		
		$('#form-patient-details').trigger("reset");
		$('#firstname').val($(this).attr('firstname') );
		$('#surname').val($(this).attr('surname') );

		// Do not call as it will fail without fixes
		// Needs error handling
	}
	
});


$('#btn-nhsid').click(function() {

	var nhsid = $('#nhs_id').val();
	if(nhsid.length !== 0){
		var data = "{\n \"Details\": {\n   \"Parameters\": {\n           \"nhs_id\": "+nhsid+"\n   }\n }\n}"
		callApi(data);
	}else{
		$('#result').val('Please enter an NHS number.');
	}

});



$('#btn-trace').click(function() {

	var firstname = $('#firstname').val().charAt(0).toUpperCase() + $('#firstname').val().slice(1).toLowerCase();
	var surname = $('#surname').val().toUpperCase();
	var data = "{\"Details\": {\"Parameters\": {\"firstname\": \""+firstname+"\", \"surname\": \""+surname+"\"} } }"
	console.log(data);
	callApi(data);
});


$('#btn-reset').click(function() {
	$('#form-patient-details').trigger("reset");
});


function callApi(data){
	$('#result').text('loading . . .');

	var settings = {
		"async": true,
		"crossDomain": true,
		"url": "https://qpu7ytfwx0.execute-api.eu-west-2.amazonaws.com/prod/trace",
		"method": "POST",
		"dataType":"json",
		"headers": {"authorizationToken": "allow"},
		"data": "{\n \"Details\": {\n   \"Parameters\": {\n           \"nhs_id\": 9658499805\n   }\n }\n}"
	}

	if(data){
		settings.data = data;
	}
	console.log(settings.data);

	$.ajax(settings).done(function (result) {
		console.log(result);
		$('#result').val(JSON.stringify(result));

		if (!(result.hasOwnProperty("errorType"))){
		// if (result !== undefined || result !== null || result.length !== 0 || !(result.hasOwnProperty("errorType"))){
			
			//check if its an nhs id or full record
			if(result.nhs_id && !result.firstname){
				console.log("result.nhs_id: "+result.nhs_id);
				var data = "{\n \"Details\": {\n   \"Parameters\": {\n           \"nhs_id\": "+result.nhs_id+"\n   }\n }\n}"
				callApi(data);
			}

			//populate patient form
			populateForm($('#form-patient-details'),result);
		}else{
			$('#result').val('No result found\n' + JSON.stringify(result));
		}
	});
}


function populateForm(form, data) {   
	
	//Clean up address
	var address = "";
	if ('addr1' in data) {address += data.addr1 + "\n";}
	if ('addr2' in data) {address += data.addr2 + "\n";}
	if ('addr3' in data) {address += data.addr3 + "\n";}
	if ('addr4' in data) {address += data.addr4 + "\n";}
	if ('addr5' in data) {address += data.addr5 + "\n";}

	// console.log("address: "+address);

	//gp details missing from api, set some fake ones
	data.gp_name = "Hibaldstow Medical Practice";
	data.gp_address = "11 Church Street \nHibaldstow \nBrigg \nLincolnshire \nDN20 9ED";



	$('#form-patient-details').trigger("reset");
	$.each(data, function(key, value) {  
		var ctrl = $('[name='+key+']', form);  

        switch(ctrl.prop("type")) { 
        	case "radio": case "checkbox":   
        	ctrl.each(function() {
        		if($(this).attr('value') == value) $(this).attr("checked",value);
        	});   
        	break; 
        	case "textarea": 
        	ctrl.each(function() {
        		if($(this).attr('name') == 'addr4'){
        			$(this).val(address);
        		} 

        		if($(this).attr('name') == 'gp_address'){
        			$(this).val(data.gp_address);
        		} 
        	});
        	break;  
        	default:
        	ctrl.val(value); 
        }  
    });  
}