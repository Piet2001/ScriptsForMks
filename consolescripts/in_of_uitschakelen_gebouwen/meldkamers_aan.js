let buildings = await $.getJSON('/api/buildings', { _: new Date().getTime() })
buildings = buildings.filter(b => b.building_type === 1)
let inschakelen = [];
let ignore_buildings = []; //id's van meldkamers die moeten worden vergeslagen.
buildings.forEach(b => {
    if (!b.enabled && !ignore_buildings.includes(b.id)) inschakelen.push(b.id)
})

procesInschakelen()

async function procesInschakelen() {
    let ID = inschakelen.length !== 0 ? inschakelen[0] : 0
    console.log(inschakelen.length)
    if (ID === 0) return;
    else if (inschakelen.length !== 0) {
        await fetch(`/buildings/${ID}/active`).then(() => {
            inschakelen.splice(0, 1)
            procesInschakelen();
        })
    }
}
