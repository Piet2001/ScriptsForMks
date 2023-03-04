let buildings = await $.getJSON('/api/buildings', { _: new Date().getTime() })
buildings = buildings.filter(b => b.building_type === 1)
let uitschakelen = [];
let ignore_buildings = []; //id's van meldkamers die moeten worden vergeslagen.
buildings.forEach(b => {
    if (b.enabled && !ignore_buildings.includes(b.id)) uitschakelen.push(b.id)
})

procesUitschakelen()

async function procesUitschakelen() {
    let ID = uitschakelen.length !== 0 ? uitschakelen[0] : 0
    console.log(uitschakelen.length)
    if (ID === 0) return;
    else if (uitschakelen.length !== 0) {
        await fetch(`/buildings/${ID}/active`).then(() => {
            uitschakelen.splice(0, 1)
            procesUitschakelen();
        })
    }
}
