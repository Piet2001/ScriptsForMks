let buildings = await $.getJSON('/api/buildings', { _: new Date().getTime() })
buildings = buildings.filter(b => b.building_type === 2)
let open = [];
let costs = [];
buildings.forEach(b => {
    if (b.is_alliance_shared) open.push(b.id)
})

procesOpenCosts()

async function procesOpenCosts() {
    let ID = open.length !== 0 ? open[0] : 0
    console.log(open.length)
    if (ID === 0) return;
    else if (open.length !== 0) {
        await fetch(`/buildings/${ID}/alliance`).then(() => {
            open.splice(0, 1)
            procesOpenCosts();
        })
    }
}
