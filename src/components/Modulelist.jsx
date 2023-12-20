/* eslint-disable react/jsx-key */
import {Button, Pagination,Form,Spinner } from "react-bootstrap"
import Listelement from "./Listelement"
import { useEffect, useState } from "react";

/* eslint-disable react/prop-types */
const Modulelist=({list,renderPageItems,title,checkoptions,setcheckoptions,Handelmove,Spinnerstate})=>{
    const [checkedItems, setCheckedItems] = useState({});
    const handelselect=(event)=>{
        let checkboxList = []
        list.map((item)=>{
            checkboxList.push(item.value)
        })
         const allChecked = checkboxList.reduce((acc, id) => {
            if(event.target.checked){
                acc[id] = true;
                setcheckoptions(checkboxList)
            }else{
                acc[id] = false;
                setcheckoptions([])
            }
             return acc;
            }, {});
            setCheckedItems(allChecked);
        
    }
    useEffect(()=>{
        let result ={}
        Object.keys(checkedItems).forEach(key =>{
            if(checkoptions.includes(key)){
                result[key] = true
            }else{
                result[key] = false
            }
            setCheckedItems(result)
        })
    },[checkoptions])
    return(
        <div className="card text-center text-white shadow border" style={{"background-color": "rgb(36, 40, 58)"}}>
        <div className="card-header border">
        {title}
        </div>
        <div className="row p-2 m-1">
            <div className="p-2 col m-2" >
            <Form.Check 
            type="checkbox"
            id="select"
            label="Select All"
            onClick={handelselect}
          />
            </div>
            <div className="col-8"></div>
            <div className="col p-2">
                <Button onClick={Handelmove}> move </Button>
            </div>
            </div>
        <div className="card-body optionslist">
           {
            Spinnerstate?
            <Spinner animation="border"/>:
            list.map((option)=>(
            <Listelement key={option.value} option={option} checkoptions={checkoptions} setcheckoptions={setcheckoptions} checkedItems={checkedItems} setCheckedItems={setCheckedItems} />
             ))
           } 
           
        
        </div>
        <div className="card-footer footer-card d-flex justify-content-center">
        <Pagination>{renderPageItems?renderPageItems():""}</Pagination>
        </div>
       </div>
    )
}
export default Modulelist