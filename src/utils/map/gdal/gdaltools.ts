export function gdalOpen(Gdal: any, gdalFiles: any) {
  if (Gdal) {
    return new Promise((resolve, reject) => {
      Gdal.open(gdalFiles)
        .then((gdalData: any) => {
          // console.log("Gdal_read", gdalData);
          // Gdal.getInfo(gdalData.datasets[0]).then((mbTilesDatasetInfo) => {
          //   console.log("mbTilesDatasetInfo", mbTilesDatasetInfo);
          // });

          const options = [
            // https://gdal.org/programs/ogr2ogr.html#description
            "-f",
            "GeoJSON",
            "-t_srs",
            "EPSG:4326",
          ];
          Gdal.ogr2ogr(gdalData.datasets[0], options)
            .then((mbTilesDatasetInfo: any) => {
              // console.log("ogr2ogr", mbTilesDatasetInfo);
              Gdal.getFileBytes(mbTilesDatasetInfo)
                .then((bytes: any) => {
                  // console.log("getFileBytes", bytes);

                  // 下载
                  // let url = window.URL.createObjectURL(new Blob([bytes], { type: "arraybuffer" }));
                  // downloadFile(url, "test.geojson");

                  // parse, 转成json数据
                  const decodedString = String.fromCharCode.apply(null, bytes);
                  // console.log("decodedString", decodedString);

                  const JSONdata = JSON.parse(decodedString);
                  // console.log("JSONdata", JSONdata);
                  resolve(JSONdata);
                })
                .catch((error: any) => {
                  reject(error);
                });

              // for debug
              // Gdal.getOutputFiles().then((files) => {
              //   files.forEach((fileInfo) => {
              //     console.log(fileInfo, `file path: ${fileInfo.path}, file size: ${fileInfo.size}`);
              //   });
              // });
            })
            .catch((error: any) => {
              reject(error);
            });
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  }
}
