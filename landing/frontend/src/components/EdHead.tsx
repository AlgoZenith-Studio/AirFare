import React from 'react';

interface Props {
  index: string;
  label: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  id: string;
}

/** Editorial section header: ruled top, [index] label, big serif title left, lead right. */
export const EdHead: React.FC<Props> = ({ index, label, title, lead, id }) => (
  <header className="ed-head">
    <div>
      <p className="ed-label"><span className="ed-idx">[{index}]</span> {label}</p>
      <h2 className="ed-title" id={id}>{title}</h2>
    </div>
    {lead && <p className="ed-lead">{lead}</p>}
  </header>
);
