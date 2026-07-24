import { useState } from "react";
import PageHeader from "@/core/components/common/PageHeader";
import RewardClaimsTable from "../components/RewardClaimsTable";
import { useRewardClaimsQuery } from "../services/rewardClaimServices";
import { useNavigate } from "react-router-dom";

export default function RewardClaimsView() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { data, isLoading, isPlaceholderData } = useRewardClaimsQuery(
    page,
    perPage
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Canjes de Premios"
        subtitle="Administra las solicitudes de recompensas y actualiza sus estados de envío."
      />

      <RewardClaimsTable
        data={data?.items ?? []}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        meta={data?.meta}
        onPageChange={setPage}
        onPerPageChange={(pp) => {
          setPerPage(pp);
          setPage(1);
        }}
        onViewDetails={(claim) => navigate(`${claim.id}`)}
      />
    </div>
  );
}
