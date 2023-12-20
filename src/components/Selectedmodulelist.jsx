/* eslint-disable react/prop-types */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import {Button} from "react-bootstrap"

function Selectedmodulelist({title,list,drop,setlist}) {

    const handeldelete = (value)=>{
       const updatedlist = list.filter((item)=> item.value != value)
       setlist(updatedlist)
    }
    const handelclear =()=>{
        setlist([])
    }
    return(
        <div className="card text-center text-white shadow border" ref={drop} style={{"background-color": "rgb(36, 40, 58)","height": "100%"}}>
        <div className="card-header border">
        {title}
        </div>
        <div className="p-2 m-1">
            <div className=" p-2" style={{"float":"right"}}>
                <Button onClick={handelclear}> Clear List</Button>
            </div>
            </div>
        <div className="card-body optionslist">
        {list.map((option)=>(
            <div className="p-2 m-1 bg-white text-black border border-dark rounded row"  key={option.value}  value={option.value}>
                <div className='col-8 text-left'>{option.label} </div> 
             <div className='col pe-auto'><FontAwesomeIcon id={option.value} icon={faTrash} onClick={()=>handeldelete(option.value)} style={{ "margin": "4px","margin-left": "18px","font-size":"18px","cursor":"pointer"}} /></div>
            </div>
           
        ))
       
        }
        </div>
        <div className="card-footer footer-card d-flex justify-content-center">
        
        </div>
       </div>
    )
}

export default Selectedmodulelist