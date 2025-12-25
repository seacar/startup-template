"use client";

import { DocumentArtifact } from "./DocumentArtifact";
import { DocumentToolbar } from "./DocumentToolbar";
import type { DocumentArtifactProps } from "./DocumentArtifact";

export interface DocumentViewerProps extends DocumentArtifactProps {
  documentId?: string;
}

export function DocumentViewer(props: DocumentViewerProps) {
  return (
    <div className="h-full flex flex-col">
      <DocumentToolbar
        onCopy={props.onCopy}
        onDownload={props.onDownload}
        onVersionChange={props.onVersionChange}
        version={props.version}
      />
      <DocumentArtifact {...props} />
    </div>
  );
}

