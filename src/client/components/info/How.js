import React from "react";
export default class extends React.Component {
    render () {
        return (
        <div>
            <p>The first version of this site was vanilla JS, HTML, CSS. I later rewrote it to ReactJS and Webpack because <s>I love page bloat</s> I needed to demonstrate what I'd learned.</p>
            <p>Backend uses NodeJS with SQLite to store info about DNS and serve it through an API.</p>
            <p>Version control done with Git.</p>
            <p>Interested in contributing? Head on over to the <a href="https://github.com/dylan-thinnes/domainatrix">GitHub page.</a></p>
        </div>
        );
    }
}
