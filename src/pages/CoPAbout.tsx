export default function CoPAbout() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">About / Access</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">About the Community of Practice</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          The FGMC2 Community of Practice (CoP) brings together stakeholders working on forest governance,
          markets, and climate across Ghana, Indonesia, and Brazil. The CoP facilitates knowledge sharing,
          peer learning, and collaborative problem-solving.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          Published resources on this portal have been validated by the PMSST team and are available for
          use by all CoP members. Resources include annual reports, case studies, policy briefs, and
          quarterly updates from programme activities.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Request Access</h2>
        <p className="text-sm text-gray-700 mb-4">To request access to the internal KMIS system or join the CoP, please contact the programme team.</p>
        <div className="bg-gray-50 rounded p-4 text-sm">
          <div><strong>Email:</strong> kmis-support@example.org</div>
          <div className="mt-1"><strong>Programme Lead:</strong> Programme Management Support Team (PMSST)</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-3">Terms of Use</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          All materials published on this portal are shared for learning purposes within the FGMC2 Community
          of Practice. Materials should not be redistributed without permission. Please cite the original
          source when referencing these materials.
        </p>
      </div>
    </div>
  );
}
