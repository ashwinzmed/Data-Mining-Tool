/* eslint-disable react/prop-types */
import { useDrag } from "react-dnd";
import {Form} from "react-bootstrap"

function Listelement({option,checkoptions,setcheckoptions,checkedItems,setCheckedItems}) {
  
  const [{ isDragging }, drag] = useDrag(() => ({
      type: "div",
      item: { value: option.value, label: option.label },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }));
    const handelcheck=(event)=>{
      if(event.target.checked){
        setcheckoptions((prev)=>[...prev,event.target.id])
        setCheckedItems((prev)=>({...prev,[event.target.id]:true}))
      }else{
        const list = checkoptions.filter((item)=>item !== event.target.id)
        setcheckoptions(list)
        setCheckedItems((prev)=>({...prev,[event.target.id]:false}))
      }
      
    }
  return (       
        <div className={(option?.selected?"bg-secondary":"bg-white")+" "+"p-2 m-1 text-black border border-dark rounded row"}  ref={drag}  style={{color:isDragging ? "yellow !important" : "","cursor":"pointer"}} value={option.value}>
          <div className="col-1">
            <Form.Check
            type="checkbox"
            id={option.value}
            checked={checkedItems[option.value]||false}
            onClick={handelcheck}
            key={option.value}
          /></div>
          <div className='col-8 text-left'>{option.label} </div> 
             
          
        </div>
  )
}

export default Listelement
