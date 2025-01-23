let buildings = await $.getJSON('/api/buildings', { _: new Date().getTime() })
buildings = buildings.filter(b => b.building_type === 22)
let extensions = {};
let number = 0;
buildings.forEach(b => {
    let ext = [`${b.id}_0`];
    b.extensions.forEach(e => {
        if (ext.indexOf(`${b.id}_${e.type_id}`) != -1) {
            ext.splice(ext.indexOf(`${b.id}_${e.type_id}`), 1)
        }
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
