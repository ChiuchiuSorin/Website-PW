onmessage = e => {
    console.log('Worker: Message received from main script');
    const result = e.data[0].nume + e.data[0].cantitate + " id: " + e.data[1];
    const workerResult = 'Result: ' + result;
    console.log("Recived: " + workerResult)
    console.log('Worker: Posting message back to main script');
    postMessage([e.data[0].id, e.data[0].nume, e.data[0].cantitate]);
}