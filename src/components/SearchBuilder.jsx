import {Form, Row, Col, Pagination, Alert } from "react-bootstrap"
import DateRangeComp from "./DateRangeComp"
import Modulelist from "./Modulelist";
import Selectedmodulelist  from "./Selectedmodulelist";
import Progressbar from "./Progressbar";
import Result from "./Result"
import { useState, useEffect, useRef } from "react"
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { addDays } from 'date-fns'
import vitalkeys from "../data/vitaldata";
import { useNavigate, useLocation } from "react-router-dom";
import { useDrop } from "react-dnd";
import {validateform} from "../utility/utils"


const SearchBuilder=()=>{
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const location = useLocation();
    const [units, setunits] = useState([])
    const [selectedunit, setselectedunit] = useState('')
    const [selectedmodule, setselectedmodule] = useState('')
    const [listOptions, setlistOptions] = useState([])
    const [selectedlistoptions, setselectedlistoptions] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [pageCount, setPageCount] = useState(0);
    const [result, setresult] = useState([])
    const [Progress, setProgress] = useState(10)
    const [Progressmax, setProgressmax] = useState(100);
    const [showprogress, setshowprogress] = useState(false)
    const [Spinner, setSpinner] = useState(false)
    const errRef = useRef();
    const [error, setError] = useState('');
    const [modalShow, setModalShow] = useState(false);
    const [checkoptions, setcheckoptions] = useState([])
    const [range, setRange] = useState([
        {
        startDate: new Date(),
        endDate: addDays(new Date(), 3),
        key: 'selection'
        }
  ])
  // eslint-disable-next-line no-unused-vars
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "div",
    drop: (item) => addOptiontolist(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

    useEffect(()=>{
        let isMounted = true;
        const controller = new AbortController()
        const getUnits = async (pagenum) => {
            try {
                const response = await axiosPrivate.get('/api/v1/list/units?page='+pagenum, {
                    signal: controller.signal
                });
                let data = response.data.results
                const transformedData = data.map(item => {
                    const { id, ...rest } = item;  
                    return { value: id, ...rest };
                });
                isMounted && setunits(prev => [...prev,...transformedData]);
                if(response.data.currentPage < response.data.pageCount){
                    getUnits(response.data.currentPage+1)
                }
            } catch (err) {
                console.error(err);
                // navigate('/login', { state: { from: location }, replace: true });
            }
        }

        getUnits(1);

        return () => {
            isMounted = false;
            controller.abort();
        }
    },[])
    useEffect(() => {
        fadeselecteditem(listOptions)
        let updatedcheckoptions = []
        let selectedListValues = selectedlistoptions.map(item => item.value);
        updatedcheckoptions = checkoptions.filter(item => selectedListValues.includes(item));
        setcheckoptions(updatedcheckoptions);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[selectedlistoptions])

    const fadeselecteditem=(listOptions)=>{
      const updatedList = listOptions.map(item => {
      const isSelected = selectedlistoptions.some(selectedItem => selectedItem.value === item.value);
      return { ...item, selected: isSelected };
        
      });
      setlistOptions(updatedList);
    }
    
    const addOptiontolist =(value)=>{
      setselectedlistoptions((prev)=> prev.filter(option=>option.value === value.value).length != 0 ?[...prev]:[...prev,value])

    }
    const handleUnitChange = (event) => {
        setselectedunit(event.target.value);
      };
    const handlePageChange = (page) => {
        if (page < 1) {
          page = 1;
        } else if (page > pageCount) {
          page = pageCount;
        }
        setCurrentPage(page);
      };
    const renderPageItems = () => {
        const items = [];
        const visiblePages = 6; // Adjust the number of visible pages as needed
        
        if (pageCount <= visiblePages) {
          // Render all pages
          for (let page = 1; page <= pageCount; page++) {
            items.push(
              <Pagination.Item
                key={page}
                active={page === currentPage}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Pagination.Item>
            );
          }
        } else {
          // Render a limited number of pages with ellipsis
          const startPage = Math.max(currentPage - Math.floor(visiblePages / 2), 1);
          const endPage = Math.min(startPage + visiblePages - 1, pageCount);
    
          if (startPage > 1) {
            items.push(
              <Pagination.First key="first" onClick={() => handlePageChange(1)} />
            );
            items.push(
              <Pagination.Prev
                key="prev"
                onClick={() => handlePageChange(currentPage - 1)}
              />
            );
            items.push(<Pagination.Ellipsis key="ellipsis-start" />);
          }
    
          for (let page = startPage; page <= endPage; page++) {
            items.push(
              <Pagination.Item
                key={page}
                active={page === currentPage}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Pagination.Item>
            );
          }
    
          if (endPage < pageCount) {
            items.push(<Pagination.Ellipsis key="ellipsis-end" />);
            items.push(
              <Pagination.Next
                key="next"
                onClick={() => handlePageChange(currentPage + 1)}
              />
            );
            items.push(
              <Pagination.Last
                key="last"
                onClick={() => handlePageChange(pageCount)}
              />
            );
          }
        }
    
        return items;
      };
    useEffect(() => {
        const handelModuleChange = () => {

            let isMounted = true;
            const controller = new AbortController()
            let moduleslug = ''
            if(selectedmodule === 'forms'){
                moduleslug = '/api/v1/list/forms?page='+currentPage
            }else if(selectedmodule === 'flowsheet'){
                moduleslug = '/api/v1/list/ice-elements?page='+currentPage
            }else if(selectedmodule === 'vitals'){
                isMounted && setlistOptions(vitalkeys)
                setPageCount(1);
                return
            }else{
              setPageCount()
              setlistOptions([])
              return
            }
            const getModuleslist = async () => {
                try {
                    setSpinner(true);
                    setlistOptions([])
                    const response = await axiosPrivate.get(moduleslug, {
                        signal: controller.signal
                    });
                    let data = response.data.results
                    const transformedData = data.map(item => {
                      if(selectedmodule === 'forms'){
                        const { _id, ...rest } = item
                        return { value: _id, ...rest };
                    }
                    else{
                        const { id, ...rest } = item  
                        return { value: id, ...rest };
                    }
                    });
                    setPageCount(response.data.pageCount);
                    setSpinner(false)
                    isMounted && fadeselecteditem(transformedData) 
                } catch (err) {
                    setSpinner(false)
                    console.error(err);
                    navigate('/login', { state: { from: location }, replace: true });
                }
            }
    
            getModuleslist();
            
            return () => {
                isMounted = false;
                controller.abort();
            }
        };
        handelModuleChange()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[currentPage, selectedmodule])  
     useEffect(()=>{
      setError('')
    },[selectedunit,selectedmodule,range,selectedlistoptions]) 
    const handelmodchange=(e)=>{
        setselectedmodule(e.target.value)
        setCurrentPage(1)
        setselectedlistoptions([])
    };
    const QueryData = async () => {
      let isMounted = true;
      const controller = new AbortController()
      const fetchDataAndUpdateState = async (eleId,index) => {
        await fetchData(1, eleId);        
        setProgress(index)
      };

      const fetchDataForOptions = async () => {
        const options = selectedlistoptions.map(item => item.value);
        setProgress(0);
        setProgressmax(options.length)
        const promises = options.map((eleId,index) => fetchDataAndUpdateState(eleId,index));
        await Promise.all(promises);
        setshowprogress(false);
        setModalShow(true);
      };
     const fetchData = async (pagenum,eleid) => {
          let slug = ''
          const options = selectedlistoptions.map(item => item.value);
          const optionstr = options.join(','); 
          const startDateString = range[0].startDate;
          const endDateString = range[0].endDate;
          const startDateTimestamp = Date.parse(startDateString);
          const endDateTimestamp = Date.parse(endDateString);
          
          if(selectedmodule === 'forms'){
              slug = `/api/v1/query/forms?unitId=${selectedunit}&startDate=${startDateTimestamp}&endDate=${endDateTimestamp}&page=${pagenum}&formId=${eleid}`
          }else if(selectedmodule === 'vitals'){
              slug = `/api/v1/query/device-data/monitor?unitId=${selectedunit}&startDate=${startDateTimestamp}&endDate=${endDateTimestamp}&page=${pagenum}&type=${optionstr}`
              
          }else if(selectedmodule === 'flowsheet'){
            slug = `/api/v1/query/ice-elements?unitId=${selectedunit}&startDate=${startDateTimestamp}&endDate=${endDateTimestamp}&page=${pagenum}&elementId=${eleid}`
          }
          try {
              const response = await axiosPrivate.get(slug, {
                  signal: controller.signal
              });
              let data = response.data.results
              const transformedData = data.map(item => {
                if( selectedmodule === "forms"){
                  // eslint-disable-next-line no-unused-vars
                  const { id, ...rest } = item;  
                  let form = selectedlistoptions.filter((obj)=>obj.value === eleid)
                  return { form_name: form[0]["label"] ,form_id:eleid , ...rest };
                }else{
                  return item
                }
              });
              isMounted && setresult(prev => [...prev,...transformedData]);
              selectedmodule === "vitals" && setProgressmax(response.data.pageCount)
              if(response.data.currentPage < response.data.pageCount){
                selectedmodule === "vitals" && setProgress(pagenum)
                  await fetchData(response.data.currentPage+1)
                  
              }
          } catch (err) {
              console.error(err);
              navigate('/login', { state: { from: location }, replace: true });
          }
      }
      if(selectedmodule ==="vitals"){
        await fetchData(1).then(() => {
          setProgress(0)
          setshowprogress(false)
          setModalShow(true)
        });
      }else{
        await fetchDataForOptions();
      }
    
    return () => {
        isMounted = false;
        controller.abort();
    }
  };

    const handelform = async (e) => {
        e.preventDefault()
        setresult([])
        let validation = validateform(selectedunit,selectedmodule,selectedlistoptions,range)
        if (!validation.val) {
          setError(validation.msg);
          errRef.current.focus();
          return; 
        }
        setshowprogress(true)
        try{
          await QueryData()
        }catch(err){
          console.error(err);
          setError('Error While Querrying Data')
          setProgress(0)
        }
        
    };
    const Handelmove=()=>{
    checkoptions.forEach(ele => {
      listOptions.forEach(obj => {
        if(ele == obj.value){
          setselectedlistoptions((prev)=> prev.filter(option=>option.value === obj.value).length != 0 ?[...prev]:[...prev,obj])
        }

      })
    });
    }
    return(
        <>    
         {error && <Alert ref={errRef} variant="danger">{error}</Alert>}                                      
        <Form className="m-3 card headerBg shadow border" style={{"background-color": "rgb(36, 40, 58)"}} onSubmit={handelform}>
            <div className="card-body">
            <Row className="form-group mb-3">
            <Form.Group as={Col} md="4" controlId="daterange">
            <Form.Label className="text-white">Date Range</Form.Label>
            <DateRangeComp range={range} setRange={setRange} />
            </Form.Group>
            <Form.Group as={Col} md="4" controlId="unit">
            <Form.Label className="text-white">Unit</Form.Label>
            <Form.Select onChange={handleUnitChange} value={selectedunit} aria-label="unit">
                <option > Select a Unit</option>
            {units.map((unit) => (    
            <option key={unit.value} value={unit.value}>
                {unit.label}
            </option>
            ))}  
            </Form.Select>
            </Form.Group>
            <Form.Group as={Col} md="4" controlId="modules">
            <Form.Label className="text-white">Modules</Form.Label>
            <Form.Select onChange={handelmodchange} value={selectedmodule} aria-label="Modules">
            <option>Select a Module</option>
            <option key="forms" value="forms">Forms</option>
            <option key="vitals" value="vitals">Vitals</option>
            <option key="flowsheet" value="flowsheet">Flowsheet</option>
            </Form.Select>
            </Form.Group>  
           </Row>
           <Row className="form-group mb-4">
           <Form.Group as={Col} md="1" controlId="listoptions1">
            </Form.Group>
           <Form.Group as={Col} md="5" controlId="listoptions2">
           <Modulelist list={listOptions} renderPageItems={renderPageItems} checkoptions={checkoptions} setcheckoptions={setcheckoptions} Handelmove={Handelmove} Spinnerstate={Spinner} title="List Options"/>
            </Form.Group>
            <Form.Group as={Col} md="5" controlId="listoptions3">
           <Selectedmodulelist list={selectedlistoptions} setlist={setselectedlistoptions}drop={drop} title="Selected List"/>
            </Form.Group>
            </Row>
            <Row className="form-group mb-4 justify-content-center">
            {showprogress?<div className="m-1 p-2 col-md-5" ><Progressbar Progress={Progress} Progressmax={Progressmax} /></div>: <button className="btn btn-success m-1 p-2 col-md-5" type="submit">Search</button>}
            </Row>
           </div>
            
        </Form>
        <Result  show={modalShow} module={selectedmodule} selectedlistoptions={selectedlistoptions}  onHide={() => setModalShow(false)} result={result}/>
        </>
        
        
    )
}

export default SearchBuilder
