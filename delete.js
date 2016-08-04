new Promise(
  function(resolve, reject) {
    console.log('1');
    resolve("hey");
    console.log('2');
  }
  ).then(
    // Log the fulfillment value
    function(val) {
      console.log('Promise fulfilled.' + val);
    })
.catch(
    // Log the rejection reason
    function(reason) {
      console.log('Handle rejected promise ('+reason+') here.');
    });