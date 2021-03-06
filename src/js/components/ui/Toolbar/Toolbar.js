import React from 'react';

export const Toolbar = ({children}) => {
  return (
    <div className="toolbar-pf">
      <div className="row">
        <div className="col-sm-12">
          {children}
        </div>
      </div>
    </div>
  );
};
Toolbar.propTypes = {
  children: React.PropTypes.node
};

export const ToolbarActions = ({children}) => (
  <div className="toolbar-pf-actions">
    {children}
  </div>
);
ToolbarActions.propTypes = {
  children: React.PropTypes.node
};

export const ToolbarResults = ({children}) => (
  <div className="toolbar-pf-results">
    <div className="row">
      <div className="col-sm-12">
        {children}
      </div>
    </div>
  </div>
);
ToolbarResults.propTypes = {
  children: React.PropTypes.node
};
