import { defineMessages, FormattedMessage } from 'react-intl';
import React from 'react';

const messages = defineMessages({
  localFolder: {
    id: 'PlanUploadTypeRadios.localFolder',
    defaultMessage: 'Local Folder'
  },
  tarArchive: {
    id: 'PlanUploadTypeRadios.tarArchive',
    defaultMessage: 'Tar Archive (tar.gz)'
  }
});

export default class PlanUploadTypeRadios extends React.Component {

  render() {
    return (
      <div className="form-group">
        <label className={`${this.props.labelColumnClasses} control-label`}>
          {this.props.title}
        </label>

        <div className={this.props.inputColumnClasses}>
          <label className="radio-inline" htmlFor="checkbox-tarball">
            <input type="radio"
                   id="checkbox-tarball"
                   name="uploadType"
                   value="tarball"
                   onChange={this.props.setUploadType}
                   defaultChecked/> <FormattedMessage {...messages.tarArchive}/>
          </label>
          <label className="radio-inline" htmlFor="checkbox-folder">
            <input ref="checkbox-folder"
                   type="radio"
                   id="checkbox-folder"
                   name="uploadType"
                   onChange={this.props.setUploadType}
                   value="folder"/> <FormattedMessage {...messages.localFolder}/>
          </label>
        </div>
      </div>
    );
  }
}

PlanUploadTypeRadios.propTypes = {
  inputColumnClasses: React.PropTypes.string.isRequired,
  labelColumnClasses: React.PropTypes.string.isRequired,
  setUploadType: React.PropTypes.func.isRequired,
  title: React.PropTypes.string.isRequired,
  uploadType: React.PropTypes.string.isRequired
};
