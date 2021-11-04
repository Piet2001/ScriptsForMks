let buildings = await $.getJSON('/api/alliance_buildings', { _: new Date().getTime() })
buildings = buildings.filter(b => b.building_type === 2)
let costs = [];
buildings.forEach(b => {
    if (b.alliance_share_credits_percentage !== 20) costs.push(b.id)
})

procesOpenCosts()

async function procesOpenCosts() {
    let ID = open.length !== 0 ? open[0] : costs.length !== 0 ? costs[0] : 0
    console.log(open.length + costs.length)
    if (ID === 0) return;
    else {
        await fetch(`/buildings/${ID}/alliance_costs/2`).then(() => {
            costs.splice(0, 1)
            procesOpenCosts();
        })
    }
}
