import JSZip from 'jszip';

export const validateform = (selectedunit,selectedmodule,selectedlistoptions,range) =>{

    if(selectedunit.length == 0){
        return ({msg:"unit not selected", val:false})
    } 
    if(selectedmodule.length == 0){
        return ({msg:"module not selected", val:false})
    }
    if(selectedlistoptions.length == 0){
        return ({msg:"list options not selected", val:false})
    }
    if(range.length == 0){
        return ({msg:" Date range not selected", val:false})
    }
    return ({val:true})
}

export const exportDownloadMultipleCSVasZIP=(zipName,csvFileDatas)=>{
    var zip = new JSZip();
    csvFileDatas.forEach(edata=>{
        var csv = `${edata.headers}\n`;
        edata.rows.forEach(function(row) {
            csv += row.join(',');
            csv += "\n";
        });
        zip.file(edata.filename,csv);
    })
    zip.generateAsync({
        type: "base64"
    }).then(function(content) {
        var hiddenElement = document.createElement('a');
        hiddenElement.href = "data:application/zip;base64," + content;
        hiddenElement.target = '_blank';
        hiddenElement.download = `${zipName}`;
        hiddenElement.click();
        hiddenElement.remove()
    });
}

export const exportDownloadCSV=(csvNameWithExtension,rows,header)=>{
    // var csv = 'Name,Title\n';
    var csv = `${header}\n`;
    rows.forEach(function(row) {
        csv += row.join(',');
        csv += "\n";
    });
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = `${csvNameWithExtension}`;
    hiddenElement.click();
}

export const formatRawDataForExport=(dataDocs,attrObj)=>{
    let data = {}

    if(Array.isArray(dataDocs) && dataDocs.length>0){
        dataDocs.forEach(es=>{
            let pid = es.patient_id
            let picu = es.unit_id
            let puid = `${pid}_____${picu}`
            let dateKey = es.on || ""
            let coldata = es.data || {}
            let col_name = es.vital || ""
            let attrColObj = attrObj[col_name] || {}
            if(data[puid]==undefined){
                data[puid] = {}
            }
            if(data[puid][dateKey]==undefined){
                data[puid][dateKey] = {}
            }
            Object.keys(coldata).forEach(timeKey=>{
                let ccdata = coldata[timeKey]
                if(data[puid][dateKey][timeKey]==undefined){
                    data[puid][dateKey][timeKey] = {}
                }
                if(data[puid][dateKey][timeKey][col_name]==undefined){
                    data[puid][dateKey][timeKey][col_name] = {value:""}
                }
                data[puid][dateKey][timeKey][col_name].value = ccdata.value || ""
                if(attrColObj.patient_alarms || attrColObj.technical_alarms){
                    let alarms = ccdata.alarms
                    let alarms_requested = []
                    if(attrColObj.patient_alarms){
                        alarms_requested.push("patient_alarms")
                    }
                    if(attrColObj.technical_alarms){
                        alarms_requested.push("technical_alarms")
                    }
                    if(alarms_requested.length > 0){
                        alarms_requested.forEach(eachAlarmType=>{
                            if(data[puid][dateKey][timeKey][eachAlarmType]==undefined){
                                data[puid][dateKey][timeKey][eachAlarmType] = {value:""}
                            }
                            let altext = ``
                            if(typeof(alarms)=="object" && Object.keys(alarms).length>0 && typeof(alarms[eachAlarmType])=="object" && Array.isArray(alarms[eachAlarmType]) && alarms[eachAlarmType].length>0){
                                alarms[eachAlarmType].forEach(ealarm=>{
                                    if(typeof(ealarm)=="object" && Object.keys(ealarm).length>0 &&  typeof(ealarm.data)=="object" && Object.keys(ealarm.data).length>0){
                                        let dalarm = ealarm.data
                                        if((dalarm.text).length>0){
                                            altext = `${altext}${dalarm.text},`
                                        }
                                    }
                                })
                            }
                            if(altext.length>0){
                                altext = altext.slice(0, -1)
                                data[puid][dateKey][timeKey][eachAlarmType].value = altext
                            }
                        })
                    }
                    
                }
                
                
            })
        })
    }
    return {data}
}
export const formatRawDataForExportondt=(dataDocs)=>{
    let data = {}

    if(Array.isArray(Object.keys(dataDocs)) && Object.keys(dataDocs).length>0){
        dataDocs.forEach(es=>{
            let pid = es.patient_id
            let picu = es.unit_id
            let dateKey = es.on || ""
            let coldata = es.data || {}
            let col_name = es.vital || ""
            // let attrColObj = attrObj[col_name] || {}
            if(data[dateKey]==undefined){
                data[dateKey] = {}
            }
            if(data[dateKey]==undefined){
                data[dateKey] = {}
            }
            Object.keys(coldata).forEach(timeKey=>{
                let ccdata = coldata[timeKey]
                if(data[dateKey][timeKey]==undefined){
                    data[dateKey][timeKey] = {}
                }
                if(data[dateKey][timeKey][col_name]==undefined){
                    data[dateKey][timeKey][col_name] = {value:""}
                    data[dateKey][timeKey][col_name] = {unit:""}
                    data[dateKey][timeKey][col_name] = {pid:""}
                }
                data[dateKey][timeKey][col_name].value = ccdata.value || ""
                data[dateKey][timeKey][col_name].pid = pid || ""
                data[dateKey][timeKey][col_name].unit = picu || ""
                
                
            })
        })
    }
    return {data}
}

export function convertArrayToCSV(obj,selectedlistoptions,downloadtype) {
    let attr={}
    selectedlistoptions.forEach(ele=>{
        attr[ele.value] = ele 
    })  
    let {data} ={}
    if(downloadtype == "dtwise"){
        ({data} = formatRawDataForExportondt(obj,attr))
    }else if(downloadtype == "ptwise" || downloadtype == "singlefile"){
        ({data} = formatRawDataForExport(obj,attr))
    }else if(downloadtype == "formwise"){
        data = obj
    }
    // let {data} = formatRawDataForExport(obj,attr)
    let headers = ["UHID","Unit","Date & Time"]
    if(downloadtype == "ptwise"){
        headers = ["Unit","Date & Time"]
    }else if(downloadtype == "dtwise"){
        headers = ["Time","UHID","Unit",'Vitals','Values']
    }
    selectedlistoptions.forEach(eccol=>{
        if(downloadtype != "dtwise" && downloadtype != "formwise"){
            headers.push(eccol.label)
        }
    })
    let csvFiles = []
    Object.keys(data).forEach(epuid=>{
        let filename = ""
        if(downloadtype == "formwise"){
            filename = `${attr[epuid]["label"]}.csv`
            headers = []
        }else{
            filename = `${epuid}.csv`
        }
        let rows = []
        let kdata = data[epuid]
        if(downloadtype == "dtwise"){
            Object.keys(kdata).forEach(edte=>{
                let dtdata = kdata[edte]
                let edteObj = strtoDateObj(epuid)
                let tmeKeys = Object.keys(dtdata)
                tmeKeys.sort()
                tmeKeys.forEach(etme=>{
                    let tdata = dtdata[etme]
                    let tmes = edte.split(":")
                    edteObj.setHours(tmes[0])
                    edteObj.setMinutes(tmes[1])
                    let edteText = dateTextWithAMPM(edteObj)
                    edteText = edteText.replace(/\n/g,"")
                    let row = [`"${edteText}"`]
                    let val = ""
                    let pid = ""
                    let unit = ""
                    val = tdata.value || ""
                    pid = tdata.pid || ""
                    unit = tdata.unit || ""
                    row.push(`"${pid}"`,`"${unit}"`,`"${attr[etme]["label"]}"`,`"${val}"`,)
                    rows.push(row)
                    
                })
            })
        }else if(downloadtype == "ptwise" || downloadtype == "singlefile"){
            let psplits = epuid.split("_____")
            let epat= psplits[0]
            let epunit= psplits[1]
            let p_uhid = epat
            filename = `${p_uhid}.csv`
            let unitText = `${epunit}`
            Object.keys(kdata).forEach(edte=>{
                let dtdata = kdata[edte]
                let edteObj = strtoDateObj(edte)
                let tmeKeys = Object.keys(dtdata)
                tmeKeys.sort()
                tmeKeys.forEach(etme=>{
                    let tdata = dtdata[etme]
                    let tmes = etme.split(":")
                    edteObj.setHours(tmes[0])
                    edteObj.setMinutes(tmes[1])
                    let edteText = dateTextWithAMPM(edteObj)
                    edteText = edteText.replace(/\n/g,"")
                    let row = [`"${p_uhid}"`,`"${unitText}"`,`"${edteText}"`]
                    if(downloadtype == "ptwise"){
                        row = [`"${unitText}"`,`"${edteText}"`]
                    }
                    selectedlistoptions.forEach(eccol=>{
                        let val = ""
                        let colname = eccol.value
                        if(typeof(tdata[colname])=="object"){
                            val = tdata[colname].value || ""
                        }
                        row.push(`"${val}"`)
                        
                    })
                    if(downloadtype == "ptwise"){
                        rows.push(row)
                    }else{
                        csvFiles.push(row)
                    }
                })
            })
        }else if(downloadtype == "formwise"){
            let row= []
            kdata.forEach((obj,index) => {
                let obj_keys = Object.keys(obj)                 
                    obj_keys.forEach(key => {
                        index == 0 && headers.push(`${key}`)
                        row.push(`"${obj[key]}"`)
                    })
            
                    rows.push(row)
            });
            
        }
        
       
        
        if(downloadtype == "ptwise" || downloadtype == "dtwise" || downloadtype == "formwise"){
            csvFiles.push({filename,rows,headers})
        }
    })
  
    if(downloadtype == "ptwise"|| downloadtype == "dtwise" || downloadtype == "formwise"){
        exportDownloadMultipleCSVasZIP("RawDataReports.zip",csvFiles)
    }else{
        exportDownloadCSV("RawDataReports.csv",csvFiles,headers) 
    }
}
export const strtoDateObj = (datestr)=>{
let year = parseInt(datestr.substring(0, 4));
let month = parseInt(datestr.substring(4, 6)) - 1; // Months are zero-based
let day = parseInt(datestr.substring(6, 8));

let dateObject = new Date(year, month, day);

return(dateObject);
}
export const dateTextWithAMPM=(date)=>{
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let year = date.getFullYear()
    let month = date.getMonth()
    let day = date.getDate()
    day = day.toString().length==1?`0${day}`:day
    let monthName = monthNames[parseInt(month)]
    let Htime=date.getHours()
    let  hr_12_clock='AM'
    if(Htime>=12){
        hr_12_clock='PM'
    }
    Htime=Htime>12?Htime-12:Htime
    Htime = Htime.toString().length>1?Htime:"0"+Htime.toString()
    let Mtime=date.getMinutes()
    Mtime = Mtime.toString().length>1?Mtime:"0"+Mtime.toString()
    return `${day} ${monthName} ${year} \n ${Htime}:${Mtime} ${hr_12_clock}`
}