let buildings = await $.getJSON('/api/buildings', { _: new Date().getTime() })
buildings = buildings.filter(b => b.building_type === 0)
let storage_upgrades = {};
let number = 0;
buildings.forEach(b => {
    let ext = [`${b.id}_fire_equipment`, `${b.id}_fire_equipment_2`, `${b.id}_fire_equipment_3`, `${b.id}_fire_equipment_4`, `${b.id}_fire_equipment_5`];
    b.storage_upgrades.forEach(e => {
        if (ext.indexOf(`${b.id}_${e.type_id}`) != -1) {
            ext.splice(ext.indexOf(`${b.id}_${e.type_id}`), 1)
        }
    })
    if (ext.length !== 0) storage_upgrades[b.id] = ext;
    number += ext.length;
})
let b = Object.keys(storage_upgrades);
let i = 0;
let numberB = b.length
async function buystorage_upgrades() {
    if (b.length === 0) return;
    i++
    console.log(`Bezig: ${i} / ${number} | ${numberB} gebouw(en)`)
    let buildingID = b[0];
    const e = storage_upgrades[buildingID];
    let extension = e.indexOf(`${buildingID}_0`) !== -1 ? `${buildingID}_0` : e[0];
    await $.post(`/buildings/${buildingID}/storage_upgrade/credits/${extension.split('_').slice(1).join('_')}?redirect_building_id=${buildingID}`).then(() => {
      e.splice(e.indexOf(extension), 1)
        if (e.length === 0) {
            delete storage_upgrades[buildingID]
            b = Object.keys(storage_upgrades);
        }
        else {
            storage_upgrades[buildingID] = e;
        }
        buystorage_upgrades();

    })

};
buystorage_upgrades()
