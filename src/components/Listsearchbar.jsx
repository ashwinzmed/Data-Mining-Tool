const listserachbar=({listserach,setlistsearch})=>{

    const handelsearchval = (e)=>{
        setlistsearch(e.target.value)
    }
    return(
        <div className="container mt-3 mb-3">
            <form className="form-inline listserachbar">
                <input className="form-control w-50" type="search" placeholder="Search" aria-label="Search" value={listserach} onChange={handelsearchval}></input>
                <button className="btn btn-outline-success searchbtn" type="submit">Search</button>
            </form>
            </div>
    )

}

export default listserachbar
