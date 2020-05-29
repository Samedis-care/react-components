import React, { Component } from "react";

interface IProps {

}

export default class Test extends Component<IProps> {
    a = () => {
        alert("hi");
    }

    render() {
        return <h1 onClick={this.a}>Hello World</h1>
    }
}