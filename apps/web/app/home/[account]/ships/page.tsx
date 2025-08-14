import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { TeamAccountLayoutPageHeader } from '../_components/team-account-layout-page-header';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';
import { ShipsPageContent } from './_components/ships-page-content';
import { loadTeamWorkspace } from '../_lib/server/team-account-workspace.loader';

interface ShipsPageProps {
  params: Promise<{ account: string }>;
}

export default async function ShipsPage({ params }: ShipsPageProps) {
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
        title={<Trans i18nKey="common:ships" />}
        description={<Trans i18nKey="common:shipsManagementDescription" />}
      />

      <PageBody>
        <ShipsPageContent accountId={workspace.account.id} />
      </PageBody>
    </>
  );
}
