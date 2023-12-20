import TopNavbar from './TopNavbar'
import SearchBuilder from './SearchBuilder'
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const Home = () =>{
    return(
        <>
         <TopNavbar />
         <DndProvider backend={HTML5Backend}>
         <SearchBuilder />
         </DndProvider>
        </>
    )
}

export default Home