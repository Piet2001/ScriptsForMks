let buildings = await $.getJSON('/api/buildings', { _: new Date().getTime() })
buildings = buildings.filter(b => b.building_type === 5)
let open = [];
let costs = [];
buildings.forEach(b => {
    if (!b.is_alliance_shared) open.push(b.id)
    if (!b.is_alliance_shared || b.alliance_share_credits_percentage !== 30) costs.push(b.id)
})

procesOpenCosts()

async function procesOpenCosts() {
    let ID = open.length !== 0 ? open[0] : costs.length !== 0 ? costs[0] : 0
    console.log(open.length + costs.length)
    if (ID === 0) return;
    else if (open.length !== 0) {
        await fetch(`/buildings/${ID}/alliance`).then(() => {
            open.splice(0, 1)
            procesOpenCosts();
        })
    }
    else {
        await fetch(`/buildings/${ID}/alliance_costs/3`).then(() => {
            costs.splice(0, 1)
            procesOpenCosts();
        })
    }
}
