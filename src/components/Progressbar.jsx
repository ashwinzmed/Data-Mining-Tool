/* eslint-disable react/prop-types */
import {ProgressBar } from "react-bootstrap"

const Progressbar = ({Progress,Progressmax}) => {
  return (
    <ProgressBar animated variant="success" now={Progress} max={Progressmax} />
  )
}

export default Progressbar