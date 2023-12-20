/* eslint-disable react/prop-types */
import {Row,Modal,Button,Form} from"react-bootstrap"
import { useState } from "react"
import JSZip from 'jszip';
import {convertArrayToCSV} from "../utility/utils"

const Result = ({show,onHide,result,module,selectedlistoptions}) => {
    const [downloadtype, setdownloadtype] = useState('')

    const handelJsondownload = async()=>{
        let ptdata = groupdata()
        if(downloadtype != "singlefile"){
            const zip = new JSZip();
            Object.keys(ptdata).forEach((key) => {
                const fileContent = JSON.stringify(ptdata[key], null, 2);
                zip.file(`${key}.json`, fileContent);
              });
            const content = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'zMedDataExport';
            link.click();
        }else{
            const fileName = "zMedDataExport";
            const json = JSON.stringify(ptdata, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            const href = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = href;
            link.download = fileName + ".json";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(href);
        }    
    }

    const handelCsvdownload = ()=>{
        if(module === "vitals"){
           convertArrayToCSV(result,selectedlistoptions,downloadtype);
        }else{
           let data = groupdata(result)
           console.log(data);
           convertArrayToCSV(data,selectedlistoptions,downloadtype);
        }
       
    }

    const groupdata =()=>{
        if(downloadtype == "ptwise"){
        const ptdata = result.reduce((groups, item) => {
            const { patient_id } = item;
            if (!groups[patient_id]) {
                groups[patient_id] = [];
            }
            groups[patient_id].push(item);
            return groups;
            }, {});
            return ptdata
        }
        else if(downloadtype == "dtwise"){
            const dtdata = result.reduce((groups, item) => {
                if(module == "vitals"){
                    const { on } = item;
                    if (!groups[on]) {
                        groups[on] = [];
                    }
                    groups[on].push(item);
                    return groups;
                }else{
                    const { date_time } = item;
                    let date_ele = new Date(date_time)
                   const date = `${date_ele.getDate()}-${date_ele.getMonth()+1}-${date_ele.getFullYear()}`
                    if (!groups[date]) {
                        groups[date] = [];
                    }
                    groups[date].push(item);
                    return groups;
                }
                }, {});
                return dtdata
        }
        if(downloadtype == "formwise"){
            const ptdata = result.reduce((groups, item) => {
                const { form_id } = item;
                if (!groups[form_id]) {
                    groups[form_id] = [];
                }
                groups[form_id].push(item);
                return groups;
                }, {});
                return ptdata
            }
        else{
            return result
            }
    }
  return (
    <Modal show={show} onHide={onHide} size="lg"  aria-labelledby="contained-modal-title-vcenter" centered>
 <Modal.Header style={{"background-color": "rgb(36, 40, 58)"}} closeButton>
        <Modal.Title id="contained-modal-title-vcenter" className="text-white">
        
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{"background-color": "rgb(36, 40, 58)"}} className="text-white">
      <div className="card m-1 shadow border" style={{"background-color": "rgb(36, 40, 58)"}}>
        <div className="card-body">
            <Row>  
            <div className="col-6 m-2 text-white card" style={{"background-color": "rgb(36, 40, 58)"}}>
               <div className="card-head p-2"><h3>Search Result</h3></div>

               <div className="card-body">
                
                <ul>
                    <li>
                    Number of Records Found : {result.length}
                    </li>
                    <li>
                    Number of Patient Records Found : {new Set(result.map(item => item?.patient_id)).size}
                    </li>
                </ul>
              
               </div>

            </div>
            <div className="col-5 m-2 text-white card" style={{"background-color": "rgb(36, 40, 58)"}}>
            {/* <Alert variant="danger"> Select a download option</Alert> */}
               <div className="card-head p-2"><h3>Download Options</h3></div>
               <div className="card-body">
                <Form>
                <Form.Select value = {downloadtype} onChange={(e)=>{setdownloadtype(e.target.value)}}>
                    <option>Select a download Option</option>
                    {module=="forms"?<option value="formwise">Form wise zip</option>:<><option value="singlefile">Single File</option><option value="dtwise">Date wise zip</option><option value="ptwise">Patient wise zip</option></>}
                </Form.Select>
                <br></br>
                <div className="d-flex justify-content-center">
                <Button  variant="info" onClick={handelJsondownload}>JSON</Button>
                <Button variant="secondary" onClick={handelCsvdownload} style={{"margin-left":"20px"}}>CSV</Button>
                </div>
                
                </Form>
              
               </div>

            </div>
            </Row>
        </div>
    </div>
      </Modal.Body>
    </Modal>
   
  )
}

export default Result