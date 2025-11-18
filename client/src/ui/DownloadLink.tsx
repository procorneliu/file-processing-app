type DownloadLinkProps = {
  link: string;
};

function DownloadLink({ link }: DownloadLinkProps) {
  return (
    <input type="text" value={link} readOnly className="rounded-sm border" />
  );
}

export default DownloadLink;
