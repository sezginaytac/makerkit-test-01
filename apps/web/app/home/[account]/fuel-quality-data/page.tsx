import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { TeamAccountLayoutPageHeader } from '../_components/team-account-layout-page-header';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';
import { FuelQualityDataPageContent } from './_components/fuel-quality-data-page-content';
import { loadTeamWorkspace } from '../_lib/server/team-account-workspace.loader';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('common:fuelQualityData.title');

  return {
    title,
  };
};

interface FuelQualityDataPageProps {
  params: Promise<{ account: string }>;
}

async function FuelQualityDataPage({ params }: FuelQualityDataPageProps) {
  const { account } = await params;
  const user = await requireUserInServerComponent();
  const workspace = await loadTeamWorkspace(account);

  // Check if user has owner role
  if (workspace.account.role !== 'owner') {
    throw new Error('Access denied: Owner role required');
  }

  return (
    <>
      <TeamAccountLayoutPageHeader
        account={account}
        title={<Trans i18nKey="common:fuelQualityData.title" />}
        description={<Trans i18nKey="common:fuelQualityData.description" />}
      />

      <PageBody>
        <FuelQualityDataPageContent accountId={workspace.account.id} />
      </PageBody>
    </>
  );
}

export default withI18n(FuelQualityDataPage);
