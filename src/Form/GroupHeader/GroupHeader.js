import React from "react";
import "./GroupHeader.css";

const GroupHeader = ({title}) =>{
    return (
        <React.Fragment>
            <h3>{title}</h3>
            <hr />
        </React.Fragment>
    )
}

export default GroupHeader;