let buildings = await $.getJSON('/api/buildings', { _: new Date().getTime() })
buildings = buildings.filter(b => b.building_type === 5)
let open = [];
let costs = [];
buildings.forEach(b => {
    if(b.is_alliance_shared) open.push(b.id)
    
    console.log(b.id)
})
async function procesOpenCosts(){
    console.log("Proces")
    let ID = open.length !== 0 ? open[0] : 0
    console.log(ID)
    console.log(open.length) 
    if (ID === 0) {
        console.log("Done")
        return;
    }
    if(open.length !== 0) {
        console.log("fetch")
        await fetch(`/buildings/${ID}/alliance`).then(() => {
            open.splice(0, 1)
            console.log(`${ID} done`)
            procesOpenCosts();
        })
    }
}
procesOpenCosts()
