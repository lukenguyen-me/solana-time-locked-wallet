/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solana_time_locked_wallet.json`.
 */
export type SolanaTimeLockedWallet = {
  address: "AgrusQgGxVBPiKBjjNAQx82u1KWP1fwAJ1wmkxNVKHWQ";
  metadata: {
    name: "solanaTimeLockedWallet";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "initializeLock";
      discriminator: [182, 214, 195, 105, 58, 73, 81, 124];
      accounts: [
        {
          name: "wallet";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [119, 97, 108, 108, 101, 116];
              },
              {
                kind: "account";
                path: "user";
              },
              {
                kind: "arg";
                path: "createdTimestamp";
              },
            ];
          };
        },
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        },
        {
          name: "unlockTimestamp";
          type: "i64";
        },
        {
          name: "createdTimestamp";
          type: "i64";
        },
      ];
    },
    {
      name: "withdraw";
      discriminator: [183, 18, 70, 156, 148, 109, 161, 34];
      accounts: [
        {
          name: "wallet";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [119, 97, 108, 108, 101, 116];
              },
              {
                kind: "account";
                path: "user";
              },
              {
                kind: "arg";
                path: "createdTimestamp";
              },
            ];
          };
        },
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "createdTimestamp";
          type: "i64";
        },
      ];
    },
  ];
  accounts: [
    {
      name: "walletState";
      discriminator: [126, 186, 0, 158, 92, 223, 167, 68];
    },
  ];
  errors: [
    {
      code: 6000;
      name: "unlockTimestampPassed";
      msg: "The unlock timestamp must be in the future.";
    },
    {
      code: 6001;
      name: "walletIsLocked";
      msg: "The wallet is locked.";
    },
  ];
  types: [
    {
      name: "walletState";
      type: {
        kind: "struct";
        fields: [
          {
            name: "owner";
            type: "pubkey";
          },
          {
            name: "balance";
            type: "u64";
          },
          {
            name: "unlockTimestamp";
            type: "i64";
          },
          {
            name: "createdTimestamp";
            type: "i64";
          },
        ];
      };
    },
  ];
};
