import React from "react";

export default class Modal {
    constructor (name, title, content) {
        this.name = name;
        this.title = title;
        this.content = content;
    }
    get element () {
        return (
        <div class="modal fade" id={ this.name } tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{ this.title }</h5>
                        <button type="button" class="close" data-dismiss="modal">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body" style={{ "max-height": "60vh", "overflow-y": "scroll" }}>{ this.content }</div>
                </div>
            </div>
        </div>
        );
    }
}
