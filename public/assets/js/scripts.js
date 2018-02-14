$(document).ready(function(){
    $(document).on('change', '#file-input', function(event){
        const file = event.target.files[0];
        var reader = new FileReader();
        reader.onload = function(){
            const csvString = reader.result;
            console.log(csvString);
        }
        const result = reader.readAsBinaryString(file);
    });


});
