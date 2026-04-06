export const metadata = {
  title: "Legals | ICONOCLAST France",
};

export default function LegalsPage() {
  return (
    <div className="legals-page">
      <h1>Legal Notice</h1>
      <p>
        ICONOCLAST FILMS SAS - Production company registered in Paris, France.
      </p>
      <p>28 Rue Chateaudun, 75009 Paris, France</p>
      <p>
        This website and all its content are the property of ICONOCLAST FILMS
        SAS. Any reproduction, representation, modification, publication, or
        adaptation of all or part of the elements of the site, by any means or
        process, without the prior written authorization of ICONOCLAST FILMS SAS
        is prohibited.
      </p>
      <p>
        For any questions regarding this legal notice, please contact us at{" "}
        <a
          href="mailto:contact@iconoclast.tv"
          style={{ textDecoration: "underline" }}
        >
          contact@iconoclast.tv
        </a>
      </p>
    </div>
  );
}
