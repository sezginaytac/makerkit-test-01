import { use } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { PageBody, PageHeader } from '@kit/ui/page';

import { createTicketsService } from '~/lib/server/tickets/tickets.service';

import { TicketsDataTable } from './_components/tickets-data-table';

interface TicketsPageProps {
  params: Promise<{
    account: string;
  }>;

  searchParams: Promise<{
    page?: string;
    query?: string;
  }>;
}

export default function TicketsPage(props: TicketsPageProps) {
  const client = getSupabaseServerClient();
  const service = createTicketsService(client);

  const { account } = use(props.params);
  const { page: pageParam, query = '' } = use(props.searchParams);

  const page = Number(pageParam ?? '1');

  const { data, pageSize, pageCount } = use(
    service.getTickets({
      accountSlug: account,
      page,
      query,
    }),
  );

  return (
    <>
      <PageHeader
        title={'Support Tickets'}
        description={
          'Here is the list of the support tickets from your customers'
        }
      />

      <PageBody>
        <TicketsDataTable
          pageIndex={page - 1}
          pageCount={pageCount}
          pageSize={pageSize}
          data={data}
        />
      </PageBody>
    </>
  );
}
