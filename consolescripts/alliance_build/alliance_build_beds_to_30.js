let buildings = await $.getJSON('/api/alliance_buildings', { _: new Date().getTime() })
buildings = buildings.filter(b => b.building_type === 2)
let toExpand = [];
buildings.forEach(b => {
    if (b.level !== 20) toExpand.push(b.id)
})

procesBuy()

async function procesBuy() {
    let ID = toExpand.length !== 0 ? toExpand[0] : toExpand.length !== 0 ? toExpand[0] : 0
    console.log(toExpand.length + toExpand.length)
    if (ID === 0) return;
    else {
        await fetch(`/buildings/${ID}/expand_do/credits?level=19`).then(() => {
            toExpand.splice(0, 1)
            procesBuy();
        })
    }
}
