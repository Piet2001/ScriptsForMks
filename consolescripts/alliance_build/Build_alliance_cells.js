let buildings = await $.getJSON('/api/alliance_buildings', { _: new Date().getTime() })
buildings = buildings.filter(b => b.building_type === 12)
let extensions = {};
let number = 0;
buildings.forEach(b => {
    let ext = [`${b.id}_0`, `${b.id}_1`, `${b.id}_2`, `${b.id}_3`, `${b.id}_4`, `${b.id}_5`, `${b.id}_6`, `${b.id}_7`, `${b.id}_8`, `${b.id}_9`];
    b.extensions.forEach(e => {
        ext.splice(ext.indexOf(`${b.id}_${e.type_id}`), 1)
    })
    if (ext.length !== 0) extensions[b.id] = ext;
    number += ext.length;
})
let b = Object.keys(extensions);
let i = 0;
let numberB = b.length
async function buyextension() {
    if (b.length === 0) return;
    i++
    console.log(`Bezig: ${i} / ${number} | ${numberB} gebouw(en)`)
    let buildingID = b[0];
    const e = extensions[buildingID];
    let extension = e.indexOf(`${buildingID}_0`) !== -1 ? `${buildingID}_0` : e[0];
    await $.post(`/buildings/${buildingID}/extension/credits/${extension.split('_')[1]}?redirect_building_id=${buildingID}`).then(() => {
        e.splice(e.indexOf(extension), 1)
        if (e.length === 0) {
            delete extensions[buildingID]
            b = Object.keys(extensions);
        }
        else {
            extensions[buildingID] = e;
        }
        buyextension();

    })

};
buyextension()
