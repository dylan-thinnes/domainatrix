import React from "react";
export default class extends React.Component {
    render () {
        return (
        <div>
            <p><small>"Cataloguing the nightmare that is the University of Edinburgh's DNS, one domain at a time."</small><br/></p>
            <p>This site serves as a catalogue of, record of, and joke about the University of Edinburgh{ "'" }s absolutely massive collection of active, inactive, and flat out absurd subdomains. Some are long, some serve a purpose, and a great number are tragic masterpieces. Somewhere in between all that the university finds a use for them.</p>
            <p>It keeps track of the domains{ "'" } statuses in the form of HTTP, Ping, and DNS checks that the user can refresh at will. It also uses the information gleaned from these checks, such as Location redirects, DNS reverse lookup, and general shenanigans to try to discover new domains from the ones on hand.</p>
            <p>With any luck, this project may later be extended to other universities with giant DNS structures and more interesting tools of analysis may come later.</p>
        </div>
        );
    }
}
