await fetch('/api/buildings')
            .then(response => response.json())
            .then(data => {
                buildings = data
                data.forEach(async function (building) {
                    if (building.extensions.length > 0) {
                        building.extensions.forEach(async function (extension) {
                            if (extension.enabled === true) {
                                $.ajax({ url: `https://www.meldkamerspel.com/buildings/${building.id}/extension_ready/${extension.type_id}/${building.id}` });
                                console.log(`${building.caption} - ${extension.caption} uitgeschakeld`)
                            }
                        })
                    }
                })
            })
