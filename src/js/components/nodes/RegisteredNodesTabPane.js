import * as _ from 'lodash';
import { connect } from 'react-redux';
import { List, Map } from 'immutable';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Formsy from 'formsy-react';

import { getRoles } from '../../selectors/roles';
import { getAvailableNodeProfiles,
         getFilteredRegisteredNodes,
         getNodesOperationInProgress } from '../../selectors/nodes';
import ConfirmationModal from '../ui/ConfirmationModal';
import FormErrorList from '../ui/forms/FormErrorList';
import NodesToolbar from './NodesToolbar';
import NodesActions from '../../actions/NodesActions';
import NodesTable from './NodesTable';
import TagNodesModal from './tag_nodes/TagNodesModal';
import { findClosestWithAttribute } from '../utils/Dom';

const messages = defineMessages({
  introspectNodes: {
    id: 'RegisteredNodesTabPane.introspectNodes',
    defaultMessage: 'Introspect Nodes'
  },
  tagNodes: {
    id: 'RegisteredNodesTabPane.tagNodes',
    defaultMessage: 'Tag Nodes'
  },
  provideNodes: {
    id: 'RegisteredNodesTabPane.provideNodes',
    defaultMessage: 'Provide Nodes',
    description: '"Providing" the nodes changes the provisioning state to "available" so that '
                 + 'they can be used in a deployment.'
  },
  deleteNodes: {
    id: 'RegisteredNodesTabPane.deleteNodes',
    defaultMessage: 'Delete Nodes'
  },
  deleteNodesModalTitle: {
    id: 'RegisteredNodesTabPane.deleteNodesModalTitle',
    defaultMessage: 'Delete Nodes'
  },
  deleteNodesModalMessage: {
    id: 'RegisteredNodesTabPane.deleteNodesModalMessage',
    defaultMessage: 'Are you sure you want to delete the selected nodes?'
  }
});

class RegisteredNodesTabPane extends React.Component {
  constructor() {
    super();
    this.state = {
      canSubmit: false,
      showDeleteModal: false,
      showTagNodesModal: false,
      submitParameters: {},
      submitType: 'introspect'
    };
  }

  componentDidUpdate() {
    this.invalidateForm(this.props.formFieldErrors.toJS());
  }

  canSubmit() {
    if(_.includes(_.values(this.refs.registeredNodesTableForm.getCurrentValues()), true)) {
      this.enableButton();
    } else {
      this.disableButton();
    }
  }

  enableButton() {
    this.setState({ canSubmit: true });
  }

  disableButton() {
    this.setState({ canSubmit: false });
  }

  invalidateForm(formFieldErrors) {
    this.refs.registeredNodesTableForm.updateInputsWithError(formFieldErrors);
  }

  getTableActions() {
    return (
      <div className="btn-group">
        <button className="btn btn-default"
                type="button"
                name="introspect"
                onClick={this.multipleSubmit.bind(this)}
                disabled={!this.state.canSubmit || this.props.nodesOperationInProgress}>
          <FormattedMessage {...messages.introspectNodes} />
        </button>
        <button className="btn btn-default"
                type="button"
                name="tag"
                onClick={() => this.setState({ showTagNodesModal: true })}
                disabled={!this.state.canSubmit || this.props.nodesOperationInProgress}>
          <FormattedMessage {...messages.tagNodes} />
        </button>
        <button className="btn btn-default"
                type="button"
                name="provide"
                onClick={this.multipleSubmit.bind(this)}
                disabled={!this.state.canSubmit || this.props.nodesOperationInProgress}>
          <FormattedMessage {...messages.provideNodes} />
        </button>
        <button className="btn btn-danger"
                type="button"
                name="delete"
                onClick={() => this.setState({ showDeleteModal: true })}
                disabled={!this.state.canSubmit || this.props.nodesOperationInProgress}>
          <FormattedMessage {...messages.deleteNodes} />
        </button>
      </div>
    );
  }

  onTagNodesSubmit(tag) {
    this.setState({
      submitType: 'tag',
      showTagNodesModal: false,
      submitParameters: { tag: tag }
    }, this.refs.registeredNodesTableForm.submit);
  }

  multipleSubmit(e) {
    this.setState({
      submitType: findClosestWithAttribute(e.target, 'name')
    }, this.refs.registeredNodesTableForm.submit);
  }

  handleSubmit(formData, resetForm, invalidateForm) {
    this.disableButton();
    const nodeIds = _.keys(_.pickBy(formData, value => !!value));

    switch (this.state.submitType) {
    case ('introspect'):
      this.props.introspectNodes(nodeIds);
      break;
    case ('tag'):
      this.props.tagNodes(nodeIds, this.state.submitParameters.tag);
      this.setState({ submitParameters: {} });
      break;
    case ('provide'):
      this.props.provideNodes(nodeIds);
      break;
    case ('delete'):
      this.setState({ showDeleteModal: false });
      this.props.deleteNodes(nodeIds);
      break;
    default:
      break;
    }

    resetForm();
  }

  render() {
    return (
      <div>
        <NodesToolbar />
        <Formsy.Form ref="registeredNodesTableForm"
                     role="form"
                     className="form"
                     onSubmit={this.handleSubmit.bind(this)}
                     onValid={this.canSubmit.bind(this)}
                     onInvalid={this.disableButton.bind(this)}>
          <FormErrorList errors={this.props.formErrors.toJS()}/>
          <NodesTable nodes={this.props.registeredNodes}
                      roles={this.props.roles}
                      dataOperationInProgress={this.props.nodesOperationInProgress}
                      nodesInProgress={this.props.nodesInProgress}
                      isFetchingNodes={this.props.isFetchingNodes}
                      tableActions={this.getTableActions.bind(this)}/>
          <ConfirmationModal show={this.state.showDeleteModal}
                             title={this.props.intl.formatMessage(messages.deleteNodesModalTitle)}
                             question={this.props.intl.formatMessage(
                                         messages.deleteNodesModalMessage)}
                             iconClass="pficon pficon-delete"
                             confirmActionName="delete"
                             onConfirm={this.multipleSubmit.bind(this)}
                             onCancel={() => this.setState({ showDeleteModal: false })}/>
          <TagNodesModal
            availableProfiles={this.props.availableProfiles.toArray()}
            onProfileSelected={this.onTagNodesSubmit.bind(this)}
            onCancel={() => this.setState({ showTagNodesModal: false, submitParameters: {} })}
            show={this.state.showTagNodesModal} />
        </Formsy.Form>
        {this.props.children}
      </div>
    );
  }
}
RegisteredNodesTabPane.propTypes = {
  availableProfiles: ImmutablePropTypes.list.isRequired,
  children: React.PropTypes.node,
  deleteNodes: React.PropTypes.func.isRequired,
  formErrors: ImmutablePropTypes.list,
  formFieldErrors: ImmutablePropTypes.map,
  intl: React.PropTypes.object,
  introspectNodes: React.PropTypes.func.isRequired,
  isFetchingNodes: React.PropTypes.bool.isRequired,
  nodesInProgress: ImmutablePropTypes.set,
  nodesOperationInProgress: React.PropTypes.bool.isRequired,
  provideNodes: React.PropTypes.func.isRequired,
  registeredNodes: ImmutablePropTypes.map,
  roles: ImmutablePropTypes.map,
  tagNodes: React.PropTypes.func.isRequired
};
RegisteredNodesTabPane.defaultProps = {
  formErrors: List(),
  formFieldErrors: Map()
};

function mapStateToProps(state) {
  return {
    availableProfiles: getAvailableNodeProfiles(state),
    roles: getRoles(state),
    registeredNodes: getFilteredRegisteredNodes(state),
    nodesInProgress: state.nodes.get('nodesInProgress'),
    nodesOperationInProgress: getNodesOperationInProgress(state),
    isFetchingNodes: state.nodes.get('isFetching')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    deleteNodes: nodeIds => dispatch(NodesActions.deleteNodes(nodeIds)),
    introspectNodes: nodeIds => dispatch(NodesActions.startNodesIntrospection(nodeIds)),
    provideNodes: nodeIds => dispatch(NodesActions.startProvideNodes(nodeIds)),
    tagNodes: (nodeIds, tag) => dispatch(NodesActions.tagNodes(nodeIds, tag))
  };
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(RegisteredNodesTabPane));
